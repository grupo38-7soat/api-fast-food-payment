from uuid import uuid4

from src.parsers.payments import parse_create_payment
from src.settings import MERCADO_PAGO_ACCESS_TOKEN, MERCADO_PAGO_BASE_URL
from src.talkers.http_client import HttpClient


class MercadoPagoTalker:
    def __init__(self):
        self.session = HttpClient().session

    async def create_payment(self):
        payload = {

        }

        headers = {
            'Authoriazation': f'Bearer {MERCADO_PAGO_ACCESS_TOKEN}',
            'X-Idempotency-Key': uuid4(),
        }

        response = await self.session.post(
            f'{MERCADO_PAGO_BASE_URL}/v1/payments',
            json=payload,
            headers=headers,
            timeout=60,
            raise_for_status=False
        )

        return await parse_create_payment(response)


    async def find_payment(self):
        payload = {

        }

        headers = {
            'Authoriazation': f'Bearer {token}',
            'X-Idempotency-Key': uuid4(),
        }

        response = await self.session.get(
            f'{}/v1/payments',
            json=payload,
            headers=headers,
            timeout=60,
            raise_for_status=False
        )

        return await parse_find_payment(response)
