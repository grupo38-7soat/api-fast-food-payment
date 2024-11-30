import { randomUUID } from 'crypto'
import { globalEnvs } from '@config/envs/global'
import { IPaymentRepository } from '@core/domain/repositories'
import { PaymentCurrentStatus } from '@core/domain/entities'
import { formatDateWithTimezone } from '@core/application/helpers'
import { IMessageBroker } from '@core/application/message-broker'
import {
  IListenPaymentUseCase,
  ListenPaymentInput,
  OrderCurrentStatus,
} from '../types/payment'
import {
  ExternalPaymentStatus,
  IPaymentSolution,
} from '../types/payment-solution'

export class ListenPaymentUseCase implements IListenPaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentSolution: IPaymentSolution,
    private readonly messageBroker: IMessageBroker,
  ) {}

  async execute({
    action,
    externalPaymentId,
  }: ListenPaymentInput): Promise<void> {
    if (!action || !externalPaymentId) return
    const [, currentAction] = action.split('.')
    if (currentAction !== 'updated') return
    const payment =
      await this.paymentRepository.findPaymentByExternalId(externalPaymentId)
    if (!payment) return
    const externalPayment = await this.paymentSolution.findPayment(
      Number(externalPaymentId),
    )
    if (!externalPayment) return
    const currentDate = formatDateWithTimezone(new Date())
    if (
      externalPayment.status === ExternalPaymentStatus.cancelled ||
      externalPayment.status === ExternalPaymentStatus.rejected
    ) {
      if (payment.getPaymentStatus() === PaymentCurrentStatus.REJEITADO) return
      payment.rejectPayment()
      await this.paymentRepository.updatePaymentStatus(
        payment.getId(),
        payment.getPaymentStatus(),
        currentDate,
      )
      await this.messageBroker.publish(globalEnvs.messageBroker.orderQueue, {
        id: randomUUID(),
        payload: {
          orderId: payment.getOrderId(),
          status: OrderCurrentStatus.CANCELADO,
          payment: payment.toJson(),
        },
      })
      return
    }
    if (externalPayment.status === ExternalPaymentStatus.approved) {
      if (payment.getPaymentStatus() === PaymentCurrentStatus.AUTORIZADO) return
      payment.authorizePayment()
      await this.paymentRepository.updatePaymentStatus(
        payment.getId(),
        payment.getPaymentStatus(),
        currentDate,
      )
      await this.messageBroker.publish(globalEnvs.messageBroker.orderQueue, {
        id: randomUUID(),
        payload: {
          orderId: payment.getOrderId(),
          status: OrderCurrentStatus.RECEBIDO,
          payment: payment.toJson(),
        },
      })
    }
  }
}
