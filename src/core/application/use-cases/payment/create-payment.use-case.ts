import { randomUUID } from 'crypto'
import { globalEnvs } from '@config/envs/global'
import {
  Payment,
  PaymentCurrentStatus,
  PaymentType,
} from '@core/domain/entities'
import { IPaymentRepository } from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import {
  formatDateWithTimezone,
  increaseTimeToDate,
} from '@core/application/helpers'
import { IMessageBroker } from '@core/application/message-broker'
import {
  ICreatePaymentUseCase,
  CreatePaymentInput,
  CreatePaymentOutput,
  Item,
  OrderCurrentStatus,
} from '../types'
import { IPaymentSolution, PaymentInput } from '../types/payment-solution'

export class CreatePaymentUseCase implements ICreatePaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentSolution: IPaymentSolution,
    private readonly messageBroker: IMessageBroker,
  ) {}

  async execute({
    orderId,
    orderAmount,
    items,
    payment,
  }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    if (!payment.type || !(payment.type in PaymentType)) {
      throw new DomainException(
        'Informe uma opção de pagamento válida',
        ExceptionCause.INVALID_DATA,
      )
    }
    if (payment.type !== PaymentType.PIX) {
      throw new DomainException(
        'Opção não implementada',
        ExceptionCause.BUSINESS_EXCEPTION,
      )
    }
    const currentDate = formatDateWithTimezone(new Date())
    const paymentId = randomUUID()
    const mountedPayment = this.mountExternalPayment(
      orderAmount,
      items,
      payment,
      paymentId,
    )
    const externalPayment =
      await this.paymentSolution.createPayment(mountedPayment)
    if (!externalPayment) {
      await this.messageBroker.publish(globalEnvs.messageBroker.orderQueue, {
        id: randomUUID(),
        payload: {
          orderId,
          status: OrderCurrentStatus.CANCELADO,
        },
      })
      return
    }
    const orderPayment = new Payment(
      payment.type,
      PaymentCurrentStatus.PENDENTE,
      currentDate,
      paymentId,
      externalPayment.id.toString(),
      currentDate,
      currentDate,
      orderId,
    )
    await this.paymentRepository.savePayment(orderPayment)
    const { paymentStatus, type } = orderPayment.toJson()
    return {
      payment: {
        id: paymentId,
        status: paymentStatus,
        type: type,
        qrCode: externalPayment.point_of_interaction.transaction_data.qr_code,
        ticketUrl:
          externalPayment.point_of_interaction.transaction_data.ticket_url,
        expirationDate: mountedPayment.date_of_expiration,
      },
    }
  }

  private mountExternalPayment(
    orderAmount: number,
    items: Item[],
    payment: CreatePaymentInput['payment'],
    paymentId: string,
  ): PaymentInput {
    return {
      transaction_amount: orderAmount,
      description: `Pagamento ${paymentId}`,
      installments: 1,
      notification_url: globalEnvs.paymentSolution.webhookUrl,
      payment_method_id: payment.type.toLowerCase(),
      date_of_expiration: increaseTimeToDate(30),
      additional_info: {
        items: items.map(item => ({
          id: item.id.toString(),
          quantity: item.quantity,
          description: item.observation,
        })),
        payer: {
          first_name: 'cliente',
        },
      },
      payer: {
        email: 'cliente@email.com',
        entity_type: 'individual',
        type: 'customer',
        identification: {
          type: 'CPF',
          number: '',
        },
      },
    }
  }
}
