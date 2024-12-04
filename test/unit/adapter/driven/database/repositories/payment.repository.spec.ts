import { DomainException, ExceptionCause } from '@core/domain/base'
import {
  Payment,
  PaymentCurrentStatus,
  PaymentType,
} from '@core/domain/entities/payment'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { PaymentRepository } from '@adapter/driven/database/repositories'
import { QueryResult } from 'pg'

jest.mock('@adapter/driven/database/postgres-connection.adapter')

describe('PaymentRepository', () => {
  let postgresConnectionAdapterMock: jest.Mocked<PostgresConnectionAdapter>
  let sut: PaymentRepository

  beforeAll(() => {
    postgresConnectionAdapterMock = {
      query: jest.fn(),
    } as unknown as jest.Mocked<PostgresConnectionAdapter>

    sut = new PaymentRepository(postgresConnectionAdapterMock)
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

  describe('savePayment', () => {
    it('should save payment successfully', async () => {
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

      await expect(sut.savePayment(payment)).resolves.toBeUndefined()

      expect(postgresConnectionAdapterMock.query).toHaveBeenCalledWith(
        expect.any(String),
        [
          payment.getId(),
          payment.getExternalId(),
          payment.getEffectiveDate(),
          payment.getType(),
          payment.getEffectiveDate(),
          payment.getOrderId(),
        ],
      )
    })

    it('should throw an error if query fails', async () => {
      postgresConnectionAdapterMock.query.mockRejectedValueOnce(
        new Error('DB error'),
      )

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

      await expect(sut.savePayment(payment)).rejects.toThrow(
        new DomainException(
          'Erro ao criar pagamento',
          ExceptionCause.PERSISTANCE_EXCEPTION,
        ),
      )
    })
  })

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      await expect(
        sut.updatePaymentStatus(
          'payment-id',
          PaymentCurrentStatus.AUTORIZADO,
          '2024-12-01T00:00:00Z',
        ),
      ).resolves.toBeUndefined()

      expect(postgresConnectionAdapterMock.query).toHaveBeenCalledWith(
        expect.any(String),
        [PaymentCurrentStatus.AUTORIZADO, '2024-12-01T00:00:00Z', 'payment-id'],
      )
    })

    it('should throw an error if query fails', async () => {
      postgresConnectionAdapterMock.query.mockRejectedValueOnce(
        new Error('DB error'),
      )

      await expect(
        sut.updatePaymentStatus(
          'payment-id',
          PaymentCurrentStatus.AUTORIZADO,
          '2024-12-01T00:00:00Z',
        ),
      ).rejects.toThrow(
        new DomainException(
          'Erro ao atualizar o status do pagamento',
          ExceptionCause.PERSISTANCE_EXCEPTION,
        ),
      )
    })
  })

  describe('findPaymentById', () => {
    it('should return payment when found', async () => {
      const paymentData = {
        id: 'payment-id',
        status: PaymentCurrentStatus.AUTORIZADO,
        type: PaymentType.PIX,
        effective_date: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
        external_id: 'external-id',
        order_id: 123,
      }

      postgresConnectionAdapterMock.query.mockResolvedValueOnce({
        rows: [paymentData],
      } as QueryResult)

      const payment = await sut.findPaymentById('some_uuid')

      expect(payment).toBeInstanceOf(Payment)
      expect(payment.getId()).toBe(paymentData.id)
    })

    it('should return null when no payment is found', async () => {
      postgresConnectionAdapterMock.query.mockResolvedValueOnce({
        rows: [],
      } as QueryResult)

      const payment = await sut.findPaymentById('some_uuid')

      expect(payment).toBeNull()
    })

    it('should throw an error if query fails', async () => {
      postgresConnectionAdapterMock.query.mockRejectedValueOnce(
        new Error('DB error'),
      )

      await expect(sut.findPaymentById('some_uuid')).rejects.toThrow(
        new DomainException(
          'Erro ao consultar o pagamento',
          ExceptionCause.PERSISTANCE_EXCEPTION,
        ),
      )
    })
  })

  describe('findPaymentByExternalId', () => {
    it('should return payment when found', async () => {
      const paymentData = {
        id: 'payment-id',
        status: PaymentCurrentStatus.AUTORIZADO,
        type: PaymentType.PIX,
        effective_date: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
        external_id: 'external-id',
        order_id: 123,
      }

      postgresConnectionAdapterMock.query.mockResolvedValueOnce({
        rows: [paymentData],
      } as QueryResult)

      const payment = await sut.findPaymentByExternalId('external-id')

      expect(payment).toBeInstanceOf(Payment)
      expect(payment.getExternalId()).toBe(paymentData.external_id)
    })

    it('should return null when no payment is found', async () => {
      postgresConnectionAdapterMock.query.mockResolvedValueOnce({
        rows: [],
      } as QueryResult)

      const payment = await sut.findPaymentByExternalId('external-id')

      expect(payment).toBeNull()
    })

    it('should throw an error if query fails', async () => {
      postgresConnectionAdapterMock.query.mockRejectedValueOnce(
        new Error('DB error'),
      )

      await expect(sut.findPaymentByExternalId('external-id')).rejects.toThrow(
        new DomainException(
          'Erro ao consultar o pagamento',
          ExceptionCause.PERSISTANCE_EXCEPTION,
        ),
      )
    })
  })
})
