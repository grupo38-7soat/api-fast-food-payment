import { Payment, PaymentCurrentStatus } from '../entities'

export type PaymentParams = {
  [field: string]: {
    exactMatch: boolean
    value: unknown
  }
}

export interface IPaymentRepository {
  savePayment(Payment: Payment): Promise<void>
  updatePaymentStatus(
    id: string,
    status: PaymentCurrentStatus,
    updatedAt: string,
  ): Promise<void>
  findPaymentById(paymentId: string): Promise<Payment>
  findPaymentByExternalId(externalId: string): Promise<Payment>
}
