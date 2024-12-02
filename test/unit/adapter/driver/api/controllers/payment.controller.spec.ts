import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { DomainException, ExceptionCause } from '@core/domain/base'
import {
    IGetPaymentUseCase,
    IListenPaymentUseCase,
    ICreatePaymentUseCase,
} from '@core/application/use-cases'

import { PaymentController } from '@adapter/driver/api/controllers'

describe('PaymentController', () => {
  let createPaymentUseCaseMock: ICreatePaymentUseCase
  let getPaymentUseCaseMock: IGetPaymentUseCase
  let listenPaymentUseCaseMock: IListenPaymentUseCase
  let sut: PaymentController
  let requestMock: Partial<ExpressRequest>
  let responseMock: jest.Mocked<ExpressResponse>
  const errorMessage = 'Some error'
  const errorCause = ExceptionCause.UNKNOWN_EXCEPTION

  beforeAll(() => {
    createPaymentUseCaseMock = {
      execute: jest.fn(),
    }
    getPaymentUseCaseMock = {
      execute: jest.fn(),
    }
    listenPaymentUseCaseMock = {
      execute: jest.fn(),
    }
  
    requestMock = {}
    responseMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<ExpressResponse>
    sut = new PaymentController(
        createPaymentUseCaseMock,
        getPaymentUseCaseMock,
        listenPaymentUseCaseMock
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('createPayment', () => {
    const body = {
      items: 'some_info',
      orderAmount: 1,
      orderId: 1,
      payment: 'some_info'
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(createPaymentUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      await sut.createPayment(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if product was created', async () => {
      requestMock.body = body
      jest
        .spyOn(createPaymentUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1, ...requestMock.body })
      await sut.createPayment(requestMock as ExpressRequest, responseMock)
      expect(createPaymentUseCaseMock.execute).toHaveBeenCalledWith(
        requestMock.body,
      )
      expect(responseMock.status).toHaveBeenCalledWith(200)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: { id: 1, ...requestMock.body },
      })
    })
  })

  describe('getPayment', () => {
    const params = {
      id: '1'
    }

    const body = {
        items: 'some_info',
        orderAmount: 1,
        payment: 'some_info'
    }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(getPaymentUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.params = params
      requestMock.body = body
      await sut.getPayment(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if payment was found', async () => {
      requestMock.params = params
      requestMock.body = body
      jest
        .spyOn(getPaymentUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1, ...requestMock.body })
      await sut.getPayment(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalledWith(200)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: {id: 1, ...requestMock.body},
      })
    })
  })

  describe('listenPayment', () => {
    const body = {
        action: '',
        externalPaymentId: '1'
      }

    it('should return error response if any exception occurs', async () => {
      jest
        .spyOn(listenPaymentUseCaseMock, 'execute')
        .mockRejectedValueOnce(new DomainException(errorMessage, errorCause))
      requestMock.body = body
      await sut.listenPayment(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalled()
      expect(responseMock.json).toHaveBeenCalled()
    })

    it('should return success response if payment was returned', async () => {
      requestMock.body = body
      jest
        .spyOn(listenPaymentUseCaseMock, 'execute')
        .mockResolvedValueOnce({ id: 1, ...requestMock.body })
      await sut.listenPayment(requestMock as ExpressRequest, responseMock)
      expect(responseMock.status).toHaveBeenCalledWith(200)
      expect(responseMock.json).toHaveBeenCalledWith({
        data: 'OK',
      })
    })
  })

})