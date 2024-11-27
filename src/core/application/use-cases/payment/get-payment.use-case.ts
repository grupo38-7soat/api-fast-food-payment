import { DomainException, ExceptionCause } from '@core/domain/base'
import { IPaymentRepository } from '@core/domain/repositories'
import { GetPaymentInput, GetPaymentOutput, IGetPaymentUseCase } from '../types'
import { formatDateWithTimezone } from '@core/application/helpers'

export class GetPaymentUseCase implements IGetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute({ orderId }: GetPaymentInput): Promise<GetPaymentOutput> {
    if (!orderId) {
      throw new DomainException(
        'O id do pedido deve ser informado',
        ExceptionCause.MISSING_DATA,
      )
    }
    const payment = await this.paymentRepository.findPaymentByOrderId(orderId)
    if (!payment) {
      throw new DomainException(
        'Pagamento não encontrado',
        ExceptionCause.NOTFOUND_EXCEPTION,
      )
    }
    const {
      id,
      type,
      paymentStatus: status,
      effectiveDate,
      externalId,
    } = payment.toJson()
    return {
      id,
      type,
      status,
      effectiveDate: formatDateWithTimezone(new Date(effectiveDate)),
      externalId,
    }
  }
}
