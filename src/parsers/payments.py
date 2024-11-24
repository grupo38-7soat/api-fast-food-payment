from typing import Tuple

from aiohttp import ClientResponse


async def parse_create_payment(response: ClientResponse):
    data = await response.json()

    if response.status != 200:
        pass
        # handle_default_error_exception(default_message=f"Erro ao autenticar: {data}",
        #                                partner_path=response.url.path,
        #                                partner_status_code=f"{response.status}")

    return data



async def parse_find_payment(response: ClientResponse):
    data = await response.json()

    if response.status != 200:
        pass
        # handle_default_error_exception(default_message=f"Erro ao autenticar: {data}",
        #                                partner_path=response.url.path,
        #                                partner_status_code=f"{response.status}")

    return data