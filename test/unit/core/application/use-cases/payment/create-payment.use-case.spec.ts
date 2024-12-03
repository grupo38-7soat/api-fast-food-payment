// import { CreatePaymentInput, CreatePaymentUseCase, IPaymentSolution } from '@core/application/use-cases'
// import { DomainException, ExceptionCause } from '@core/domain/base';
// import { PaymentType } from '@core/domain/entities';
// import { IPaymentRepository } from '@core/domain/repositories';
// import { IMessageBroker } from '@core/application/message-broker';

// // Mock das dependências
// jest.mock('crypto', () => ({
// randomUUID: jest
//     .fn()
//     .mockReturnValueOnce('f01fa975-1b06-44f0-9e1d-ad5923f5feef'),
// }))


// jest.mock('@core/application/helpers', () => ({
//   formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-02T00:00:00Z'),
//   increaseTimeToDate: jest.fn().mockReturnValue('2024-12-02T01:00:00Z'),
// }));

// describe('CreatePaymentUseCase', () => {
//     let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
//     let paymentSolutionMock: jest.Mocked<IPaymentSolution>
//     let messageBrokerMock: jest.Mocked<IMessageBroker>
//     let sut: CreatePaymentUseCase
  

//   beforeAll(() => {
//     paymentRepositoryMock = {
//       savePayment: jest.fn(),
//       updatePaymentStatus: jest.fn(),
//       findAllPayments: jest.fn(),
//       findPaymentByOrderId: jest.fn(),
//       findPaymentByExternalId: jest.fn()
//     } as unknown as jest.Mocked<IPaymentRepository>
//     paymentSolutionMock = {
//       createPayment: jest.fn()
//     } as unknown as jest.Mocked<IPaymentSolution>
//     messageBrokerMock = {
//         publish: jest.fn(),
//       } as unknown as jest.Mocked<IMessageBroker>
//     sut = new CreatePaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock)
//   })

//   afterEach(() => {
//     jest.clearAllMocks()
//   })

//   afterAll(() => {
//     jest.resetAllMocks()
//   })

//   it('should be defined', () => {
//     expect(sut).toBeDefined()
//   })

//   it('should throw error if payment type is invalid', async () => {
//     const invalidPayment = { type: PaymentType.DINHEIRO };
//     const input: CreatePaymentInput = {
//       orderId: 1,
//       orderAmount: 100,
//       items: [],
//       payment: invalidPayment,
//     }

//     await expect(sut.execute(input)).rejects.toThrow(
//       new DomainException('Informe uma opção de pagamento válida', ExceptionCause.INVALID_DATA)
//     )
//   })

//   it('should throw error if payment type is not implemented', async () => {
//     const input = {
//       orderId: 1,
//       orderAmount: 100,
//       items: [],
//       payment: { type: PaymentType.CARTAO_CREDITO },
//     };

//     await expect(sut.execute(input)).rejects.toThrowError(
//       new DomainException('Opção não implementada', ExceptionCause.BUSINESS_EXCEPTION)
//     )
//   })

//   it('should create payment successfully and save it', async () => {
//     // const externalPayment = {
//     //   id: 'external-id',
//     //   point_of_interaction: {
//     //     transaction_data: {
//     //       qr_code: 'qr-code',
//     //       ticket_url: 'ticket-url',
//     //     },
//     //   },
//     // }

//     paymentSolutionMock.createPayment.mockResolvedValue(null);

//     const input = {
//       orderId: 1,
//       orderAmount: 100,
//       items: [{ id: 1, quantity: 1, observation: 'item1' }],
//       payment: { type: PaymentType.PIX },
//     }

//     const result = await sut.execute(input);

//     expect(result).toEqual({
//       payment: {
//         id: 'random-uuid',
//         status: 'PENDENTE',
//         type: PaymentType.PIX,
//         qrCode: 'qr-code',
//         ticketUrl: 'ticket-url',
//         expirationDate: '2024-12-02T01:00:00Z',
//       },
//     })
//     expect(paymentRepositoryMock.savePayment).toHaveBeenCalledWith(expect.objectContaining({
//       paymentId: 'random-uuid',
//     }))
//   })

//   it('should publish cancellation message to message broker if payment creation fails', async () => {
//     paymentSolutionMock.createPayment.mockResolvedValue(null);

//     const input = {
//       orderId: 1,
//       orderAmount: 100,
//       items: [{ id: 1, quantity: 1, observation: 'item1' }],
//       payment: { type: PaymentType.PIX },
//     }

//     await sut.execute(input);

//     expect(messageBrokerMock.publish).toHaveBeenCalledWith(
//       expect.any(String), // Queue name
//       expect.objectContaining({
//         payload: { orderId: '1', status: 'CANCELADO' },
//       })
//     )
//   })
// })


import { CreatePaymentUseCase, IPaymentSolution } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories';
import { IMessageBroker } from '@core/application/message-broker';

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
    it('should ...', () => {
      // alguma coisa
    })
  })
})
