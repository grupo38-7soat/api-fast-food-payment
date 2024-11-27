import { PaymentCurrentStatus, PaymentType } from '@core/domain/entities'

type Item = {
  id: number
  quantity: number
  observation?: string
}

type Payment = {
  type: PaymentType
}

export type CreatePaymentInput = {
  customerId?: string
  items: Item[]
  orderAmount: number
  payment: Payment
}

export type CreatePaymentOutput = {
  payment: {
    id: string
    status: PaymentCurrentStatus
    type: PaymentType
    qrCode: string
    ticketUrl: string
    expirationDate: string
  }
}

export type GetPaymentInput = {
  orderId: number
}

export type GetPaymentOutput = {
  id: string
  status: PaymentCurrentStatus
  type: PaymentType
  effectiveDate: string
  externalId: string
}

export type ListenPaymentInput = {
  action: string
  externalPaymentId: string
}

export interface ICreatePaymentUseCase {
  execute(input: CreatePaymentInput): Promise<CreatePaymentOutput>
}

export interface IGetPaymentUseCase {
  execute(input: GetPaymentInput): Promise<GetPaymentOutput>
}

export interface IListenPaymentUseCase {
  execute(input: ListenPaymentInput): Promise<void>
}
