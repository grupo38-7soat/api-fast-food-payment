import { DomainException, ExceptionCause } from '@core/domain/base'
import { IPaymentRepository } from '@core/domain/repositories'
import { GetPaymentInput, GetPaymentOutput, IGetPaymentUseCase } from '../types'
import { formatDateWithTimezone } from '@core/application/helpers'

export class GetPaymentUseCase implements IGetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute({ paymentId }: GetPaymentInput): Promise<GetPaymentOutput> {
    if (!paymentId) {
      throw new DomainException(
        'O id do pagamento deve ser informado',
        ExceptionCause.MISSING_DATA,
      )
    }
    const payment = await this.paymentRepository.findPaymentById(paymentId)
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
      orderId,
    } = payment.toJson()
    return {
      id,
      type,
      status,
      effectiveDate: formatDateWithTimezone(new Date(effectiveDate)),
      externalId,
      orderId,
    }
  }
}
