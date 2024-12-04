import { globalEnvs } from '@config/envs/global'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { PaymentType } from '@core/domain/entities'
import { IPaymentRepository } from '@core/domain/repositories'
import {
  CreatePaymentInput,
  CreatePaymentUseCase,
  ExternalPaymentStatus,
  IPaymentSolution,
  PaymentOutput,
} from '@core/application/use-cases'
import { IMessageBroker } from '@core/application/message-broker'

jest.mock('@core/application/helpers', () => ({
  formatDateWithTimezone: jest.fn().mockReturnValue('2024-12-02T00:00:00Z'),
  increaseTimeToDate: jest.fn().mockReturnValue('2024-12-02T01:00:00Z'),
}))

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('9c7729ad-0bf0-49ba-8c65-990e71029c66'),
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
      findPaymentById: jest.fn(),
      findPaymentByExternalId: jest.fn(),
    } as unknown as jest.Mocked<IPaymentRepository>

    paymentSolutionMock = {
      createPayment: jest.fn(),
    } as unknown as jest.Mocked<IPaymentSolution>

    messageBrokerMock = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<IMessageBroker>

    sut = new CreatePaymentUseCase(
      paymentRepositoryMock,
      paymentSolutionMock,
      messageBrokerMock,
    )
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

  it('should throw error if payment type is invalid', async () => {
    const input: CreatePaymentInput = {
      orderId: 1,
      orderAmount: 100,
      items: [],
      payment: { type: null },
    }

    await expect(sut.execute(input)).rejects.toThrow(
      new DomainException(
        'Informe uma opção de pagamento válida',
        ExceptionCause.INVALID_DATA,
      ),
    )
  })

  it('should throw error if payment type is not implemented', async () => {
    const input = {
      orderId: 1,
      orderAmount: 100,
      items: [],
      payment: { type: PaymentType.CARTAO_CREDITO },
    }

    await expect(sut.execute(input)).rejects.toThrow(
      new DomainException(
        'Opção não implementada',
        ExceptionCause.BUSINESS_EXCEPTION,
      ),
    )
  })

  it('should create payment successfully and save it', async () => {
    const external: PaymentOutput = {
      additional_info: {
        items: [
          {
            category_id: '1',
            description: '',
            id: '1',
            picture_url: '',
            quantity: '1',
            title: '',
            unit_price: '10',
          },
        ],
        payer: {
          first_name: 'nome',
        },
      },
      collector_id: 1,
      coupon_amount: 10,
      currency_id: 'real',
      date_approved: '',
      date_created: '',
      date_last_updated: '',
      date_of_expiration: '',
      description: '',
      external_reference: '123',
      id: 1,
      installments: 1,
      issuer_id: '',
      notification_url: '',
      operation_type: '',
      payment_method: {
        id: 'randomUUID',
        issuer_id: '1',
        type: PaymentType.PIX,
      },
      payment_method_id: '',
      payment_type_id: '',
      point_of_interaction: {
        transaction_data: {
          qr_code: 'qr-code',
          qr_code_base64: '',
          ticket_url: 'ticket-url',
        },
      },
      status: ExternalPaymentStatus.approved,
      status_detail: '',
      transaction_amount: 1,
      transaction_amount_refunded: 1,
    }

    paymentSolutionMock.createPayment.mockResolvedValueOnce(external)

    const input = {
      orderId: 1,
      orderAmount: 100,
      items: [{ id: 1, quantity: 1, observation: 'item1' }],
      payment: { type: PaymentType.PIX },
    }

    const result = await sut.execute(input)

    expect(result).toEqual({
      payment: {
        expirationDate: '2024-12-02T01:00:00Z',
        qrCode: 'qr-code',
        status: 'PENDENTE',
        type: PaymentType.PIX,
        ticketUrl: 'ticket-url',
        id: '9c7729ad-0bf0-49ba-8c65-990e71029c66',
      },
    })
    expect(paymentRepositoryMock.savePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '9c7729ad-0bf0-49ba-8c65-990e71029c66',
      }),
    )
  })

  it('should publish cancellation message to message broker if payment creation fails', async () => {
    paymentSolutionMock.createPayment.mockResolvedValue(null)

    const input = {
      orderId: 1,
      orderAmount: 100,
      items: [{ id: 1, quantity: 1, observation: 'item1' }],
      payment: { type: PaymentType.PIX },
    }

    await sut.execute(input)

    expect(messageBrokerMock.publish).toHaveBeenCalledWith(
      globalEnvs.messageBroker.orderQueue,
      {
        id: '9c7729ad-0bf0-49ba-8c65-990e71029c66',
        payload: { orderId: 1, status: 'CANCELADO' },
      },
    )
  })
})
