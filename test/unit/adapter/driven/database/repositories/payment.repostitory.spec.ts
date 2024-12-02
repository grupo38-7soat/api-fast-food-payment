import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { PaymentRepository } from '@adapter/driven/database/repositories'
import { DomainException } from '@core/domain/base'
import { Payment, PaymentCurrentStatus, PaymentType } from '@core/domain/entities'
// import { PaymentStatus } from '@core/domain/value-objects'
import { QueryResult } from 'pg'

jest.mock('@adapter/driven/database/postgres-connection.adapter')

describe('PaymentRepository', () => {
  let postgresConnectionAdapter: jest.Mocked<PostgresConnectionAdapter>
  let sut: PaymentRepository

  beforeAll(() => {
    postgresConnectionAdapter =
      new PostgresConnectionAdapter() as jest.Mocked<PostgresConnectionAdapter>
    sut = new PaymentRepository(postgresConnectionAdapter)
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

  describe('savePayment method', () => {
    it('should save a new payment and return an ID', async () => {
      const payment = new Payment(PaymentType.PIX, PaymentCurrentStatus.PENDENTE, '', '1', '1', '2024-12-01', '', 1)
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1}]
      } as QueryResult)

      const id = await sut.savePayment(payment)
      expect(id).toBe(1)
      expect(postgresConnectionAdapter.query).toHaveBeenLastCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining(
          [
            payment.getType(),
            payment.getPaymentStatus(),
            payment.getEffectiveDate(),
            payment.getId(),
            payment.getExternalId(),
            payment.getCreatedAt(),
            payment.getUpdatedAt(),
            payment.getOrderId()
          ]
        )
      )


    it('should throws if saving fails', async () => {
      postgresConnectionAdapter.query.mockRejectedValueOnce(
        new Error('Database error'),
      )
      await expect(sut.savePayment(payment)).rejects.toThrow(
        DomainException,
      )
    })
  })

  describe('updatePaymentStatus method', () => {
    const update_status = {
      id: '1',
      status: PaymentCurrentStatus.AUTORIZADO,
      updatedAt: new Date().toISOString(),
    }

    it('should update a payment status', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [{ id: 1}]
      } as QueryResult)

      await sut.updatePaymentStatus(
        update_status.id,
        update_status.status,
        update_status.updatedAt,
      )

      expect(postgresConnectionAdapter.query).toHaveBeenLastCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(
          [
            update_status.id,
            update_status.status,
            update_status.updatedAt,
          ]
        )
      )
    })
  })

  describe('findAllPayments method', () => {
    const input = {
      id: '1',
      status: PaymentCurrentStatus.AUTORIZADO,
      updatedAt: '2024-12-02',
    }
    it('should find and return all the payments', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [input],
      } as QueryResult)

      const payments = await sut.findAllPayments()
      expect(payments).toHaveLength(1)
      expect(payments[0].getId()).toBe(input[0].id)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [],
      )
      
    })
    
    it('should return payment filtered by parameters', async () => {
      postgresConnectionAdapter.query.mockResolvedValueOnce({
        rows: [input],
      } as QueryResult)
      const payments = await sut.findAllPayments({
        id: { value: 1, exactMatch: true },
      })
      expect(payments).toHaveLength(1)
      expect(postgresConnectionAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['AUTORIZADO']),
      )
    })
  })

  // describe('findPaymentByOrderId method', () => {
  //   const input = {
  //     orderId: 1
  //   }
  //   it('should find and return a payment by the orderId', async () => {
      
  //   })
  // })

  // describe('findPaymentByExternalId method', () => {
  //   const input = {
  //     externalId: '1'
  //   }

  //   it('should find and return a payment by the externalOrderId', async () => {
      
  //   })
  // })

})

 