import { ListenPaymentUseCase, IPaymentSolution, ListenPaymentInput } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { IMessageBroker } from '@core/application/message-broker'
import { PaymentRepository } from '@adapter/driven/database/repositories'
import { Payment, PaymentCurrentStatus, PaymentType } from '@core/domain/entities'

describe('ListenPaymentUseCase', () => {
    let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
    let paymentSolutionMock: jest.Mocked<IPaymentSolution>
    let messageBrokerMock: jest.Mocked<IMessageBroker>
    let sut: ListenPaymentUseCase
  

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
    sut = new ListenPaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock)
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
    const input: ListenPaymentInput = {
        action: '1',
        externalPaymentId: '1'
    }

    it('should throw an error if a product is not found', async () => {
        paymentRepositoryMock.findPaymentByExternalId.mockResolvedValueOnce(null)
        await expect(sut.execute(input)).rejects.toThrow(
          new DomainException(
            'Pagamento 1 não encontrado',
            ExceptionCause.NOTFOUND_EXCEPTION,
          ),
        )
        expect(paymentRepositoryMock.findPaymentByExternalId).toHaveBeenCalledWith(
          'id',
          1,
        )
      })

    it('should throw an error if the total action is invalid', async () => {
        const mockPayment = new Payment(
          PaymentType.PIX,
          PaymentCurrentStatus.AUTORIZADO,
          '2024-12-01',
          '1',
          '1',
          null,
          null,
          1
        )
        paymentRepositoryMock.findPaymentByExternalId.mockResolvedValueOnce(
            mockPayment,
        )
       
      })

  })
})
