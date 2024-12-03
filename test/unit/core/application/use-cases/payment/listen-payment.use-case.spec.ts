import { ListenPaymentUseCase } from '@core/application/use-cases'
import { IPaymentRepository } from '@core/domain/repositories';
import { IMessageBroker } from '@core/application/message-broker';
import { ExternalPaymentStatus, IPaymentSolution, PaymentOutput } from '@core/application/use-cases/types';
import { Payment, PaymentCurrentStatus, PaymentType } from '@core/domain/entities';
import { globalEnvs } from '@config/envs/global';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

describe('ListenPaymentUseCase', () => {
  let paymentRepositoryMock: jest.Mocked<IPaymentRepository>
  let paymentSolutionMock: jest.Mocked<IPaymentSolution>
  let messageBrokerMock: jest.Mocked<IMessageBroker>
  let sut: ListenPaymentUseCase;

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
    sut = new ListenPaymentUseCase(paymentRepositoryMock, paymentSolutionMock, messageBrokerMock);
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

  it('should do nothing if action or externalPaymentId is missing', async () => {
    await sut.execute({ action: '', externalPaymentId: '' });
    expect(paymentRepositoryMock.findPaymentByExternalId).not.toHaveBeenCalled();
    expect(paymentSolutionMock.findPayment).not.toHaveBeenCalled();
    expect(messageBrokerMock.publish).not.toHaveBeenCalled();
  });

  it('should do nothing if action does not contain "updated"', async () => {
    const action = 'payment.created';
    const externalPaymentId = '123';

    await sut.execute({ action, externalPaymentId });
    expect(paymentRepositoryMock.findPaymentByExternalId).not.toHaveBeenCalled();
    expect(paymentSolutionMock.findPayment).not.toHaveBeenCalled();
    expect(messageBrokerMock.publish).not.toHaveBeenCalled();
  });

  it('should reject payment and publish cancelation if status is cancelled', async () => {
    const action = 'payment.updated';
    const externalPaymentId = '123';
    const payment = new Payment(
      PaymentType.PIX,
      PaymentCurrentStatus.PENDENTE,
      '2024-12-01T00:00:00Z',
      'payment-id',
      'external-id',
      '2024-12-01T00:00:00Z',
      '2024-12-01T00:00:00Z',
      123,
    )

    const externalPayment: PaymentOutput = {
      additional_info: {
        items: [{ category_id: '1', description: '', id: '1', picture_url: '', quantity: '1', title: '', unit_price: '10'  }],
        payer: {
          first_name: 'nome'
        }
      },
      collector_id: 1,
      coupon_amount: 10,
      currency_id: 'real',
      date_approved: '',
      date_created: '',
      date_last_updated: '',
      date_of_expiration: '',
      description: '',
      external_reference: '',
      id: 1,
      installments: 1,
      issuer_id: '',
      notification_url: '',
      operation_type: '',
      payment_method: {
        id: 'randomUUID',
        issuer_id: '1',
        type: PaymentType.PIX
      },
      payment_method_id: '',
      payment_type_id: '',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'qr-code',
          qr_code_base64: '',
          ticket_url: 'ticket-url',
        }
      },
      status: ExternalPaymentStatus.approved,
      status_detail: '',
      transaction_amount: 1,
      transaction_amount_refunded: 1
    }

    paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment);
    paymentSolutionMock.findPayment.mockResolvedValue(externalPayment);

    await sut.execute({ action, externalPaymentId });

    expect(payment.rejectPayment).toHaveBeenCalled();
    expect(paymentRepositoryMock.updatePaymentStatus).toHaveBeenCalledWith(
      'payment-id',
      PaymentCurrentStatus.REJEITADO,
      expect.any(String),
    );
    expect(messageBrokerMock.publish).toHaveBeenCalledWith(globalEnvs.messageBroker.orderQueue, {
      id: 'mocked-uuid',
      payload: {
        orderId: 'order-id',
        status: 'CANCELADO',
        payment: { id: 'payment-id' },
      },
    });
  });

  it('should authorize payment and publish received if status is approved', async () => {
    const action = 'payment.updated';
    const externalPaymentId = '123';
    const payment = new Payment(
      PaymentType.PIX,
      PaymentCurrentStatus.PENDENTE,
      '2024-12-01T00:00:00Z',
      'payment-id',
      'external-id',
      '2024-12-01T00:00:00Z',
      '2024-12-01T00:00:00Z',
      123,
    )
    const externalPayment: PaymentOutput = {
      additional_info: {
        items: [{ category_id: '1', description: '', id: '1', picture_url: '', quantity: '1', title: '', unit_price: '10'  }],
        payer: {
          first_name: 'nome'
        }
      },
      collector_id: 1,
      coupon_amount: 10,
      currency_id: 'real',
      date_approved: '',
      date_created: '',
      date_last_updated: '',
      date_of_expiration: '',
      description: '',
      external_reference: '',
      id: 1,
      installments: 1,
      issuer_id: '',
      notification_url: '',
      operation_type: '',
      payment_method: {
        id: 'randomUUID',
        issuer_id: '1',
        type: PaymentType.PIX
      },
      payment_method_id: '',
      payment_type_id: '',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'qr-code',
          qr_code_base64: '',
          ticket_url: 'ticket-url',
        }
      },
      status: ExternalPaymentStatus.approved,
      status_detail: '',
      transaction_amount: 1,
      transaction_amount_refunded: 1
    }

    paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment);
    paymentSolutionMock.findPayment.mockResolvedValue(externalPayment);
    
    await sut.execute({ action, externalPaymentId });

    expect(payment.authorizePayment).toHaveBeenCalled();
    expect(paymentRepositoryMock.updatePaymentStatus).toHaveBeenCalledWith(
      'payment-id',
      PaymentCurrentStatus.AUTORIZADO,
      expect.any(String), // Current date is dynamically generated
    );
    expect(messageBrokerMock.publish).toHaveBeenCalledWith(globalEnvs.messageBroker.orderQueue, {
      id: 'mocked-uuid',
      payload: {
        orderId: 'order-id',
        status: 'RECEBIDO',
        payment: { id: 'payment-id' },
      },
    })
  })

  it('should not update payment if status is already correct', async () => {
    const action = 'payment.updated';
    const externalPaymentId = '123';
    const payment = new Payment(
      PaymentType.PIX,
      PaymentCurrentStatus.PENDENTE,
      '2024-12-01T00:00:00Z',
      'payment-id',
      'external-id',
      '2024-12-01T00:00:00Z',
      '2024-12-01T00:00:00Z',
      123,
    )
    const externalPayment: PaymentOutput = {
      additional_info: {
        items: [{ category_id: '1', description: '', id: '1', picture_url: '', quantity: '1', title: '', unit_price: '10'  }],
        payer: {
          first_name: 'nome'
        }
      },
      collector_id: 1,
      coupon_amount: 10,
      currency_id: 'real',
      date_approved: '',
      date_created: '',
      date_last_updated: '',
      date_of_expiration: '',
      description: '',
      external_reference: '',
      id: 1,
      installments: 1,
      issuer_id: '',
      notification_url: '',
      operation_type: '',
      payment_method: {
        id: 'randomUUID',
        issuer_id: '1',
        type: PaymentType.PIX
      },
      payment_method_id: '',
      payment_type_id: '',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'qr-code',
          qr_code_base64: '',
          ticket_url: 'ticket-url',
        }
      },
      status: ExternalPaymentStatus.approved,
      status_detail: '',
      transaction_amount: 1,
      transaction_amount_refunded: 1
    }

    paymentRepositoryMock.findPaymentByExternalId.mockResolvedValue(payment);
    paymentSolutionMock.findPayment.mockResolvedValue(externalPayment);

    await sut.execute({ action, externalPaymentId });

    expect(payment.rejectPayment).not.toHaveBeenCalled();
    expect(paymentRepositoryMock.updatePaymentStatus).not.toHaveBeenCalled();
    expect(messageBrokerMock.publish).not.toHaveBeenCalled();
  })
})
