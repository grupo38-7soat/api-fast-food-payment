import { globalEnvs } from '@config/envs/global'
import {
  GetPaymentUseCase,
  ListenPaymentUseCase,
  CreatePaymentUseCase,
} from '@core/application/use-cases'
import {
  HealthController,
  PaymentController,
} from '@adapter/driver/api/controllers'
import { ExpressHttpServerAdapter } from '@adapter/driver/api/express-server.adapter'
import { IHttpServer } from '@adapter/driver/api/types/http-server'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { PaymentRepository } from '@adapter/driven/database/repositories/payment.repository'
import { MercadoPagoAdapter } from '@adapter/driven/payment-solution/mercado-pago.adapter'
import { HttpClientAdapter } from '@adapter/driven/http/http-client.adapter'
import { IAMQPServer } from '@adapter/driver/message-broker/types/message-broker'
import { AMQPServerAdapter } from '@adapter/driver/message-broker/amqp-server.adapter'
import { MessageBrokerAdapter } from '@adapter/driver/message-broker/message-broker.adapter'
const messageBrokerAdapter = new MessageBrokerAdapter(
  globalEnvs.messageBroker.url,
)

const postgresConnectionAdapter = new PostgresConnectionAdapter()
const httpClientAdapter = new HttpClientAdapter(
  globalEnvs.paymentSolution.baseUrl,
)
const paymentSolution = new MercadoPagoAdapter(httpClientAdapter)
// repositories
const paymentRepository = new PaymentRepository(postgresConnectionAdapter)
// useCases
const createPaymentUseCase = new CreatePaymentUseCase(
  paymentRepository,
  paymentSolution,
  messageBrokerAdapter,
)
const getPaymentUseCase = new GetPaymentUseCase(paymentRepository)
const listenPaymentUseCase = new ListenPaymentUseCase(
  paymentRepository,
  paymentSolution,
  messageBrokerAdapter,
)
// controllers
const healthController = new HealthController()
const paymentController = new PaymentController(
  createPaymentUseCase,
  getPaymentUseCase,
  listenPaymentUseCase,
)
const amqpServer: IAMQPServer = new AMQPServerAdapter(
  messageBrokerAdapter,
  createPaymentUseCase,
)
amqpServer.run(globalEnvs.messageBroker.paymentQueue)
const httpServer: IHttpServer = new ExpressHttpServerAdapter(
  healthController,
  paymentController,
)
httpServer.run(globalEnvs.api.serverPort)
