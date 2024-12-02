import { CreatePaymentInput, CreatePaymentUseCase, IPaymentSolution } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { IMessageBroker } from '@core/application/message-broker'
import { PaymentType } from '@core/domain/entities'


jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-01T00:00:00Z'),
  }))

jest.mock('@core/application/helpers', () => ({
  increaseTimeToDate: jest.fn().mockReturnValue('2024-12-01T00:00:00Z'),
  }))

jest.mock('crypto', () => ({
randomUUID: jest
    .fn()
    .mockReturnValueOnce('f01fa975-1b06-44f0-9e1d-ad5923f5feef'),
}))

describe('CreatePaymentUseCase', () => {
    let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
    let paymentSolutionMock: jest.Mocked<IPaymentSolution>
    let messageBrokerMock: jest.Mocked<IMessageBroker>
    let sut: CreatePaymentUseCase
  

  beforeAll(() => {
    paymentRepositoryMock = {
      savePayment: jest.fn(),
      updatePaymentStatus: jest.fn(),
      findAllPayments: jest.fn(),
      findPaymentByOrderId: jest.fn(),
      findPaymentByExternalId: jest.fn()
    } as unknown as jest.Mocked<IPaymentRepository>
    paymentSolutionMock = {
      createPayment: jest.fn()
    } as unknown as jest.Mocked<IPaymentSolution>
    messageBrokerMock = {
        publish: jest.fn(),
      } as unknown as jest.Mocked<IMessageBroker>
    sut = new CreatePaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock)
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
    const input: CreatePaymentInput = {
      orderId: 1,
      orderAmount: 10,
      items: [{ id: 1, quantity: 1, observation: '' }],
      payment: {
        type: PaymentType.CARTAO_CREDITO
      },
    }

    it('should throw an error if the payment option is invalid', async () => {
      paymentSolutionMock.createPayment.mockResolvedValueOnce(null)
      await expect(sut.execute(input)).rejects.toThrow(
        new DomainException(
          'Opção não implementada',
          ExceptionCause.NOTFOUND_EXCEPTION,
        ),
      )
      expect(paymentSolutionMock.createPayment).not.toHaveBeenCalledWith()
    })
  })
})
