// import { ListenPaymentUseCase, IPaymentSolution } from '@core/application/use-cases'
// import { IPaymentRepository } from '@core/domain/repositories'
// import { IMessageBroker } from '@core/application/message-broker'
// import { PaymentCurrentStatus } from '@core/domain/entities'
// import { ExternalPaymentStatus } from '@core/application/use-cases/types/payment-solution'
// import { globalEnvs } from '@config/envs/global';

// // Mocking de dependências
// jest.mock('crypto', () => ({
//   randomUUID: jest.fn().mockReturnValue('random-uuid'),
// }));

// jest.mock('@core/application/helpers', () => ({
//   formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-02T00:00:00Z'),
// }));

// describe('ListenPaymentUseCase', () => {
//   let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
//   let paymentSolutionMock: jest.Mocked<IPaymentSolution>
//   let messageBrokerMock: jest.Mocked<IMessageBroker>
//   let sut: ListenPaymentUseCase

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
//     sut = new ListenPaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock)
//   })

//   it('should do nothing if action or externalPaymentId is not provided', async () => {
//     const input = { action: '', externalPaymentId: '' };
//     await sut.execute(input);

//     expect(paymentRepositoryMock.findPaymentByExternalId).not.toHaveBeenCalled();
//     expect(paymentSolutionMock.findPayment).not.toHaveBeenCalled();
//     expect(messageBrokerMock.publish).not.toHaveBeenCalled();
//   });

//   it('should do nothing if action is not "updated"', async () => {
//     const input = { action: 'created.other', externalPaymentId: '123' };
//     await sut.execute(input);

//     expect(paymentRepositoryMock.findPaymentByExternalId).not.toHaveBeenCalled();
//     expect(paymentSolutionMock.findPayment).not.toHaveBeenCalled();
//     expect(messageBrokerMock.publish).not.toHaveBeenCalled();
//   });

//   it('should do nothing if payment is not found in the repository', async () => {
//     const input = { action: 'payment.updated', externalPaymentId: '123' };
//     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(null);

//     await sut.execute(input);

//     expect(paymentSolutionMock.findPayment).not.toHaveBeenCalled();
//     expect(messageBrokerMock.publish).not.toHaveBeenCalled();
//   });

//   it('should do nothing if external payment is not found', async () => {
//     const input = { action: 'payment.updated', externalPaymentId: '123' };
//     const payment = { getId: jest.fn().mockReturnValue('1'), getPaymentStatus: jest.fn().mockReturnValue(PaymentCurrentStatus.PENDENTE) };
//     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment.getId());
//     paymentSolutionMock.findPayment.mockResolvedValue(null);

//     await sut.execute(input);

//     expect(paymentRepositoryMock.updatePaymentStatus).not.toHaveBeenCalled();
//     expect(messageBrokerMock.publish).not.toHaveBeenCalled();
//   });

//   it('should reject payment if status is cancelled or rejected', async () => {
//     const input = { action: 'payment.updated', externalPaymentId: '123' };
//     const payment = {
//       getId: jest.fn().mockReturnValue('1'),
//       getPaymentStatus: jest.fn().mockReturnValue(PaymentCurrentStatus.PENDENTE),
//       rejectPayment: jest.fn(),
//       toJson: jest.fn().mockReturnValue({}),
//     };
//     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment.getId());
//     paymentSolutionMock.findPayment.mockResolvedValue({ status: ExternalPaymentStatus.rejected });

//     await sut.execute(input);

//     expect(payment.rejectPayment).toHaveBeenCalled();
//     expect(paymentRepositoryMock.updatePaymentStatus).toHaveBeenCalled();
//     expect(messageBrokerMock.publish).toHaveBeenCalledWith(globalEnvs.messageBroker.orderQueue, expect.objectContaining({
//       payload: { orderId: '1', status: 'CANCELADO', payment: {} },
//     }));
//   });

//   it('should authorize payment if status is approved', async () => {
//     const input = { action: 'payment.updated', externalPaymentId: '123' };
//     const payment = {
//       getId: jest.fn().mockReturnValue('1'),
//       getPaymentStatus: jest.fn().mockReturnValue(PaymentCurrentStatus.PENDENTE),
//       authorizePayment: jest.fn(),
//       toJson: jest.fn().mockReturnValue({}),
//     };
//     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment.getId);
//     paymentSolutionMock.findPayment.mockResolvedValue({ status: ExternalPaymentStatus.approved });

//     await sut.execute(input);

//     expect(payment.authorizePayment).toHaveBeenCalled();
//     expect(paymentRepositoryMock.updatePaymentStatus).toHaveBeenCalled();
//     expect(messageBrokerMock.publish).toHaveBeenCalledWith(globalEnvs.messageBroker.orderQueue, expect.objectContaining({
//       payload: { orderId: '1', status: 'RECEBIDO', payment: {} },
//     }));
//   });
// });





// import { ListenPaymentUseCase, IPaymentSolution, ListenPaymentInput } from '@core/application/use-cases'
// import { IPaymentRepository } from '@core/domain/repositories'
// import { DomainException, ExceptionCause } from '@core/domain/base'
// import { IMessageBroker } from '@core/application/message-broker'
// import { PaymentRepository } from '@adapter/driven/database/repositories'
// import { Payment, PaymentCurrentStatus, PaymentType } from '@core/domain/entities'

// describe('ListenPaymentUseCase', () => {
//     let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
//     let paymentSolutionMock: jest.Mocked<IPaymentSolution>
//     let messageBrokerMock: jest.Mocked<IMessageBroker>
//     let sut: ListenPaymentUseCase
  

//   beforeAll(() => {
//     paymentRepositoryMock = {
//         savePayment: jest.fn(),
//         updatePaymentStatus: jest.fn(),
//         findAllPayments: jest.fn(),
//         findPaymentByOrderId: jest.fn(),
//         findPaymentByExternalId: jest.fn()
//       } as unknown as jest.Mocked<IPaymentRepository>
//     paymentSolutionMock = {
//         createPayment: jest.fn()
//     } as unknown as jest.Mocked<IPaymentSolution>
//     messageBrokerMock = {
//         publish: jest.fn(),
//       } as unknown as jest.Mocked<IMessageBroker>
//     sut = new ListenPaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock)
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

//   describe('execute method', () => {
//     const input: ListenPaymentInput = {
//         action: '1',
//         externalPaymentId: '1'
//     }

//     it('should ...', () => {
//       // alguma coisa
//     })

//     // it('should throw an error if a product is not found', async () => {
//     //     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValueOnce(null)
//     //     await expect(sut.execute(input)).rejects.toThrow(
//     //       new DomainException(
//     //         'Pagamento 1 não encontrado',
//     //         ExceptionCause.NOTFOUND_EXCEPTION,
//     //       ),
//     //     )
//     //     expect(paymentRepositoryMock.findPaymentByExternalId).toHaveBeenCalledWith(
//     //       'id',
//     //       1,
//     //     )
//     //   })

//     // it('should throw an error if the total action is invalid', async () => {
//     //     const mockPayment = new Payment(
//     //       PaymentType.PIX,
//     //       PaymentCurrentStatus.AUTORIZADO,
//     //       '2024-12-01',
//     //       '1',
//     //       '1',
//     //       null,
//     //       null,
//     //       1
//     //     )
//     //     paymentRepositoryMock.findPaymentByExternalId.mockResolvedValueOnce(
//     //         mockPayment,
//     //     )
       
//     //   })

//   })
// })


import { ListenPaymentUseCase, IPaymentSolution } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories'
import { IMessageBroker } from '@core/application/message-broker'


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
    it('should ...', () => {
      // alguma coisa
    })
  })
})
