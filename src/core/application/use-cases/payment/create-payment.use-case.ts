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
import {
  ICreatePaymentUseCase,
  CreatePaymentInput,
  CreatePaymentOutput,
} from '../types'
import { IPaymentSolution, PaymentInput } from '../types/payment-solution'

export class CreatePaymentUseCase implements ICreatePaymentUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentSolution: IPaymentSolution,
  ) {}

  async execute({
    items,
    orderAmount,
    payment,
  }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    if (!(payment.type in PaymentType)) {
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
    const orderPaymentId = randomUUID()
    const mountedPayment = this.mountExternalPayment(
      orderAmount,
      items,
      payment,
      orderPaymentId,
    )
    const externalPayment =
      await this.paymentSolution.createPayment(mountedPayment)
    if (!externalPayment) {
      throw new DomainException(
        'Não foi possível processar o pedido',
        ExceptionCause.BUSINESS_EXCEPTION,
      )
    }
    const orderPayment = new Payment(
      payment.type,
      PaymentCurrentStatus.PENDENTE,
      currentDate,
      orderPaymentId,
      externalPayment.id.toString(),
      currentDate,
      currentDate,
    )
    await this.paymentRepository.savePayment(orderPayment)
    const { paymentStatus, type } = orderPayment.toJson()
    return {
      payment: {
        id: orderPaymentId,
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
    items: any[], // criar um tipo
    payment: CreatePaymentInput['payment'],
    orderPaymentId: string,
  ): PaymentInput {
    return {
      transaction_amount: orderAmount,
      description: `Pagamento ${orderPaymentId}`,
      installments: 1,
      notification_url: globalEnvs.paymentSolution.webhookUrl,
      payment_method_id: payment.type.toLowerCase(),
      date_of_expiration: increaseTimeToDate(30),
      additional_info: {
        items: items.map(item => ({
          id: item.product.getId().toString(),
          quantity: item.quantity,
          description: item.observation,
          title: item.product.getName(),
          unit_price: item.product.getPrice(),
          picture_url: item.product.getImageLinks()[0] || '',
          category_id: item.product.getCategory(),
        })),
        payer: undefined,
      },
      payer: undefined,
    }
  }
}
