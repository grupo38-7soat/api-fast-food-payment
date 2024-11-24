import os
from decouple import config
from enum import Enum

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_PATH = config("BASE_PATH")
MERCADO_PAGO_BASE_URL = 'https://api.mercadopago.com/'
MERCADO_PAGO_ACCESS_TOKEN = 'TEST-4788172636710430-072120-eaaa0bdcb82643806f45f3d90d12deda-374408556'
LISTEN_ORDER_PAYMENT_URL = 'https://webhook.site/8c691017-e92c-4452-bb90-501938217b4a'


class PaymentType(Enum):
    DINHEIRO = 'DINHEIRO',
    CARTAO_CREDITO = 'CARTAO_CREDITO',
    CARTAO_DEBITO = 'CARTAO_DEBITO',
    PIX = 'PIX',
    VALE_REFEICAO = 'VALE_REFEICAO'


class PaymentCurrentStatus(Enum):
    PENDENTE = 'PENDENTE',
    AUTORIZADO = 'AUTORIZADO',
    REJEITADO = 'REJEITADO',
    REEMBOLSADO = 'REEMBOLSADO'
