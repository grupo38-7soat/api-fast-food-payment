import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export interface IHealthController {
  check(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}

export interface IPaymentController {
  createPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  getPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  listenPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}
