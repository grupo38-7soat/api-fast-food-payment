import { GetPaymentUseCase } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories'

describe('GetPaymentUseCase', () => {
  let paymentRepositoryMock: IPaymentRepository
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
    it('should ...', () => {
      // alguma coisa
    })
  })
})
