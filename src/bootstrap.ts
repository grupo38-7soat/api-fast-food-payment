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
)
const getPaymentUseCase = new GetPaymentUseCase(paymentRepository)
const listenPaymentUseCase = new ListenPaymentUseCase(
  paymentRepository,
  paymentSolution,
)
// controllers
const healthController = new HealthController()

const orderController = new PaymentController(
  createPaymentUseCase,
  getPaymentUseCase,
  listenPaymentUseCase,
)
const server: IHttpServer = new ExpressHttpServerAdapter(
  healthController,
  orderController,
)
server.run(globalEnvs.api.serverPort)
