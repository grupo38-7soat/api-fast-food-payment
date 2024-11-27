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
  
  export const orderRoutes: IRouteProps[] = [
    {
      resource: '/checkout',
      method: HttpMethod.POST,
      middleware: (
        _request: ExpressRequest,
        _response: ExpressResponse,
        next: ExpressNextFuction,
      ) => next(),
      handler: 'makeCheckout',
    },
    {
      resource: '/pedidos/:id/pagamento',
      method: HttpMethod.GET,
      middleware: (
        _request: ExpressRequest,
        _response: ExpressResponse,
        next: ExpressNextFuction,
      ) => next(),
      handler: 'getOrderPayment',
    },
    {
      resource: '/pedidos/webhook-pagamento',
      method: HttpMethod.POST,
      middleware: (
        _request: ExpressRequest,
        _response: ExpressResponse,
        next: ExpressNextFuction,
      ) => next(),
      handler: 'listenOrderPayment',
    },
  ]
  