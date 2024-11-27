import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFuction,
} from 'express'
import { HttpMethod, IRouteProps } from './types/http-server'

export const healthRoutes: IRouteProps[] = [
  {
    resource: '/health',
    method: HttpMethod.GET,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'check',
  },
]

export const paymentRoutes: IRouteProps[] = [
  {
    resource: '/pagamentos',
    method: HttpMethod.POST,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'createPayment',
  },
  {
    resource: '/pagamentos/:id',
    method: HttpMethod.GET,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'getPayment',
  },
  {
    resource: '/pagamentos/webhook',
    method: HttpMethod.POST,
    middleware: (
      _request: ExpressRequest,
      _response: ExpressResponse,
      next: ExpressNextFuction,
    ) => next(),
    handler: 'listenPayment',
  },
]
