import { globalEnvs } from '@config/envs/global'
import {
  GetOrderPaymentUseCase,
  ListenOrderPaymentUseCase,
  MakeCheckoutUseCase,
  SearchOrdersUseCase,
  UpdateOrderStatusUseCase
} from '@core/application/use-cases'
import {
  HealthController,
  OrderController,
} from '@adapter/driver/api/controllers'
import { ExpressHttpServerAdapter } from '@adapter/driver/api/express-server.adapter'
import { IHttpServer } from '@adapter/driver/api/types/http-server'
import { PostgresConnectionAdapter } from '@adapter/driven/database/postgres-connection.adapter'
import { CustomerRepository } from '@adapter/driven/database/repositories'
import { PaymentRepository } from '@adapter/driven/database/repositories/payment.repository'
import { OrderRepository } from '@adapter/driven/database/repositories/order.repository'
import { MercadoPagoAdapter } from '@adapter/driven/payment-solution/mercado-pago.adapter'
import { HttpClientAdapter } from '@adapter/driven/http/http-client.adapter'

const postgresConnectionAdapter = new PostgresConnectionAdapter()
const httpClientAdapter = new HttpClientAdapter(
  globalEnvs.paymentSolution.baseUrl,
)
const paymentSolution = new MercadoPagoAdapter(httpClientAdapter)
// repositories
const paymentRepository = new PaymentRepository(postgresConnectionAdapter)
const orderRepository = new OrderRepository(postgresConnectionAdapter)
// useCases
const makeCheckoutUseCase = new MakeCheckoutUseCase(
  paymentRepository,
  orderRepository,
  paymentSolution,
)
const searchOrdersUseCase = new SearchOrdersUseCase(orderRepository)
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository)
const getOrderPaymentUseCase = new GetOrderPaymentUseCase(paymentRepository)
const listenOrderPaymentUseCase = new ListenOrderPaymentUseCase(
  orderRepository,
  paymentRepository,
  paymentSolution,
)
// controllers
const healthController = new HealthController()

const orderController = new OrderController(
  makeCheckoutUseCase,
  searchOrdersUseCase,
  updateOrderStatusUseCase,
  getOrderPaymentUseCase,
  listenOrderPaymentUseCase,
)
const server: IHttpServer = new ExpressHttpServerAdapter(
  healthController,
  orderController,
)
server.run(globalEnvs.api.serverPort)
