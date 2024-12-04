import { PaymentCurrentStatus, PaymentType } from '@core/domain/entities'

export type Item = {
  id: number
  quantity: number
  observation?: string
}

export enum OrderCurrentStatus {
  PENDENTE = 'PENDENTE',
  RECEBIDO = 'RECEBIDO',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

type Payment = {
  type: PaymentType
}

export type CreatePaymentInput = {
  orderId: number
  orderAmount: number
  items: Item[]
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
  paymentId: string
}

export type GetPaymentOutput = {
  id: string
  status: PaymentCurrentStatus
  type: PaymentType
  effectiveDate: string
  externalId: string
  orderId: number
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
