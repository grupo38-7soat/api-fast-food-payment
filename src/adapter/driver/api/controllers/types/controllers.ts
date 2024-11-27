import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export interface IHealthController {
  check(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}

export interface IOrderController {
  makeCheckout(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  getOrderPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
  listenOrderPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse>
}
