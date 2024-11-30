import {
  Payment,
  PaymentCurrentStatus,
  PaymentType,
} from '@core/domain/entities/payment'
import { IPaymentRepository, PaymentParams } from '@core/domain/repositories'
import { DomainException, ExceptionCause } from '@core/domain/base'
import { PostgresConnectionAdapter } from '../postgres-connection.adapter'

type PaymentData = {
  id: string
  status: PaymentCurrentStatus
  type: PaymentType
  effective_date: string
  updated_at: string
  external_id: string
  order_id: number
}

export class PaymentRepository implements IPaymentRepository {
  table: string

  constructor(
    private readonly postgresConnectionAdapter: PostgresConnectionAdapter,
  ) {
    this.table = 'fast_food.payment'
  }

  async savePayment(payment: Payment): Promise<void> {
    const currentDate = payment.getEffectiveDate()
    try {
      await this.postgresConnectionAdapter.query(
        `
            INSERT INTO ${this.table}(id, external_id, updated_at, type, effective_date, order_id)
            VALUES($1::uuid, $2::text, $3::timestamp, $4::fast_food.payment_type_enum, $5::timestamp, $6::numeric)
          `,
        [
          payment.getId(),
          payment.getExternalId(),
          currentDate,
          payment.getType(),
          currentDate,
          payment.getOrderId(),
        ],
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao criar pagamento',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentCurrentStatus,
    updatedAt: string,
  ): Promise<void> {
    try {
      await this.postgresConnectionAdapter.query(
        `
            UPDATE ${this.table} SET status = $1::fast_food.payment_status_enum,
            updated_at = $2::timestamp WHERE id = $3::uuid
          `,
        [status, updatedAt, id],
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao atualizar o status do pagamento',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async findAllPayments(params?: PaymentParams): Promise<Payment[]> {
    console.log(params)
    throw new DomainException('findAllPayments not implemented.')
  }

  async findPaymentByOrderId(orderId: number): Promise<Payment> {
    try {
      const { rows } = await this.postgresConnectionAdapter.query<PaymentData>(
        `
            SELECT p.id, p.status, p.type, p.effective_date, p.updated_at, p.external_id, p.order_id FROM ${this.table} p
            WHERE p.order_id = $1::integer;
          `,
        [orderId],
      )
      if (!rows || !rows.length) return null
      return new Payment(
        rows[0].type,
        rows[0].status,
        rows[0].effective_date,
        rows[0].id,
        rows[0].external_id,

        rows[0].effective_date,
        rows[0].updated_at,
        rows[0].order_id,
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao consultar o pagamento',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }

  async findPaymentByExternalId(externalId: string): Promise<Payment> {
    try {
      const { rows } = await this.postgresConnectionAdapter.query<PaymentData>(
        `
            SELECT p.id, p.status, p.type, p.effective_date, p.updated_at, p.external_id, p.order_id FROM ${this.table} p
            WHERE p.external_id = $1::text;
          `,
        [externalId],
      )
      if (!rows || !rows.length) return null
      return new Payment(
        rows[0].type,
        rows[0].status,
        rows[0].effective_date,
        rows[0].id,
        rows[0].external_id,
        rows[0].effective_date,
        rows[0].updated_at,
        rows[0].order_id,
      )
    } catch (error) {
      console.error(error)
      throw new DomainException(
        'Erro ao consultar o pagamento',
        ExceptionCause.PERSISTANCE_EXCEPTION,
      )
    }
  }
}
