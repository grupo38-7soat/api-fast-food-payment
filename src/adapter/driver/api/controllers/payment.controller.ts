import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import {
  IGetPaymentUseCase,
  IListenPaymentUseCase,
} from '@core/application/use-cases'
import { HttpResponseHelper } from '../helpers'
import { IPaymentController } from './types/controllers'

export class PaymentController implements IPaymentController {
  constructor(
    private readonly getPaymentUseCase: IGetPaymentUseCase,
    private readonly listenPaymentUseCase: IListenPaymentUseCase,
  ) {}

  async getPayment(
    request: ExpressRequest,
    response: ExpressResponse,
  ): Promise<ExpressResponse> {
    try {
      const paymentId = request.params.id
      const paymentData = await this.getPaymentUseCase.execute({
        paymentId,
      })
      return HttpResponseHelper.onSucess(response, { data: paymentData })
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
