import { DomainException, ExceptionCause } from '@core/domain/base'
import {
  Payment,
  PaymentCurrentStatus,
  PaymentType,
} from '@core/domain/entities'
import { IPaymentRepository } from '@core/domain/repositories'
import { GetPaymentUseCase } from '@core/application/use-cases'
import {
  GetPaymentInput,
  GetPaymentOutput,
} from '@core/application/use-cases/types'

jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn(() => '2024-12-01T00:00:00Z'),
}))

describe('GetPaymentUseCase', () => {
  let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
  let sut: GetPaymentUseCase

  beforeAll(() => {
    paymentRepositoryMock = {
      savePayment: jest.fn(),
      updatePaymentStatus: jest.fn(),
      findPaymentById: jest.fn(),
      findPaymentByExternalId: jest.fn(),
    }
    sut = new GetPaymentUseCase(paymentRepositoryMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('execute method', () => {
    it('should return payment details when payment is found', async () => {
      const input: GetPaymentInput = { paymentId: 'some_uuid' }
      const mockPayment = new Payment(
        PaymentType.PIX,
        PaymentCurrentStatus.PENDENTE,
        '2024-12-01T00:00:00Z',
        'payment-id',
        'external-id',
        '2024-12-01T00:00:00Z',
        '2024-12-01T00:00:00Z',
        123,
      )

      paymentRepositoryMock.findPaymentById.mockResolvedValue(mockPayment)

      const result: GetPaymentOutput = await sut.execute(input)

      expect(paymentRepositoryMock.findPaymentById).toHaveBeenCalledWith(
        'some_uuid',
      )
      expect(result).toEqual({
        id: 'payment-id',
        type: PaymentType.PIX,
        status: PaymentCurrentStatus.PENDENTE,
        effectiveDate: '2024-12-01T00:00:00Z',
        externalId: 'external-id',
        orderId: 123,
      })
    })

    it('should throw DomainException if paymentId is missing', async () => {
      const input: GetPaymentInput = { paymentId: null }

      await expect(sut.execute(input)).rejects.toThrow(
        new DomainException(
          'O id do pagamento deve ser informado',
          ExceptionCause.MISSING_DATA,
        ),
      )
    })

    it('should throw DomainException if payment is not found', async () => {
      const input: GetPaymentInput = { paymentId: 'some_uuid' }
      paymentRepositoryMock.findPaymentById.mockResolvedValue(null)

      await expect(sut.execute(input)).rejects.toThrow(
        new DomainException(
          'Pagamento não encontrado',
          ExceptionCause.NOTFOUND_EXCEPTION,
        ),
      )
    })
  })
})
