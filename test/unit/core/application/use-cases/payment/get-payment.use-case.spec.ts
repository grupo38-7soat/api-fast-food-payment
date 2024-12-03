import { GetPaymentUseCase } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { GetPaymentInput, GetPaymentOutput } from '@core/application/use-cases/types'
import { Payment, PaymentCurrentStatus, PaymentType } from '@core/domain/entities'

// Mocking dependencies
jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn(() => 'formatted-date'),
}))

describe('GetPaymentUseCase', () => {
  let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
  let sut: GetPaymentUseCase

  beforeAll(() => {
    paymentRepositoryMock = {
      savePayment: jest.fn(),
      updatePaymentStatus: jest.fn(),
      findAllPayments: jest.fn(),
      findPaymentByOrderId: jest.fn(),
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
      const input: GetPaymentInput = { orderId: 123 }
      const mockPayment = new Payment(
        PaymentType.PIX,
        PaymentCurrentStatus.PENDENTE,
        '2024-12-01T00:00:00Z',
        'payment-id',
        'external-id',
        '2024-12-01T00:00:00Z',
        '2024-12-01T00:00:00Z',
        123
      )

      paymentRepositoryMock.findPaymentByOrderId.mockResolvedValue(mockPayment)

      const result: GetPaymentOutput = await sut.execute(input)

      expect(paymentRepositoryMock.findPaymentByOrderId).toHaveBeenCalledWith(123)
      expect(mockPayment.toJson).toHaveBeenCalled()
      expect(result).toEqual({
        id: 'payment-id',
        type: PaymentType.PIX,
        status: PaymentCurrentStatus.AUTORIZADO,
        effectiveDate: '2024-12-01T00:00:00Z',
        externalId: 'external-id',
      })
    })
  })

  it('should throw DomainException if orderId is missing', async () => {
    const input: GetPaymentInput = { orderId: null } 

    await expect(sut.execute(input)).rejects.toThrow(
      new DomainException(
        'O id do pedido deve ser informado',
        ExceptionCause.MISSING_DATA,
      ),
    )
  })

  it('should throw DomainException if payment is not found', async () => {
    const mockPayment = new Payment(
      PaymentType.PIX,
      PaymentCurrentStatus.PENDENTE,
      '2024-12-01T00:00:00Z',
      'payment-id',
      'external-id',
      '2024-12-01T00:00:00Z',
      '2024-12-01T00:00:00Z',
      3
    )

    const input: GetPaymentInput = { orderId: 1 }
    paymentRepositoryMock.findPaymentByOrderId.mockResolvedValue(mockPayment)

    await expect(sut.execute(input)).rejects.toThrow(
      new DomainException(
        'Pagamento não encontrado',
        ExceptionCause.NOTFOUND_EXCEPTION,
      ),
    )
  })
})



//testes