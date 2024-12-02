import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import {
  IGetPaymentUseCase,
  IListenPaymentUseCase,
  ICreatePaymentUseCase,
} from '@core/application/use-cases'
import { HttpResponseHelper } from '../helpers'
import { IPaymentController } from './types/controllers'

export class PaymentController implements IPaymentController {
  constructor(
    private readonly CreatePaymentUseCase: ICreatePaymentUseCase,
    private readonly getPaymentUseCase: IGetPaymentUseCase,
    private readonly listenPaymentUseCase: IListenPaymentUseCase,
  ) {}

  // esse vai sair
  async createPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const orderData = await this.CreatePaymentUseCase.execute({
        items: request.body.items,
        orderAmount: request.body.orderAmount,
        payment: request.body.payment,
        orderId: request.body.orderId,
      })
      return HttpResponseHelper.onSucess(response, { data: orderData })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }

  async getPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const orderId = request.params.id
      const orderPaymentData = await this.getPaymentUseCase.execute({
        orderId: Number(orderId),
      })
      return HttpResponseHelper.onSucess(response, { data: orderPaymentData })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }

  async listenPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const { action, data } = request.body
      await this.listenPaymentUseCase.execute({
        action,
        externalPaymentId: data?.id,
      })
      return HttpResponseHelper.onSucess(response, { data: 'OK' })
    } catch (error) {
      return HttpResponseHelper.onError(response, { error })
    }
  }
}
