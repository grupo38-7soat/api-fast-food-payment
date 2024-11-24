import asyncio
# noinspection PyPackageRequirements
from aiohttp import ClientSession, TCPConnector
from typing import Dict, Type
from redis import StrictRedis


class Singleton(type(StrictRedis)):
    _instances: Dict[Type, object] = {}

    def __call__(cls, *args, **kwargs) -> object:
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class HttpClient(metaclass=Singleton):
    def __init__(self):
        conn = TCPConnector(ttl_dns_cache=60, limit=0)
        self.session = ClientSession(connector=conn)

    def __del__(self):
        asyncio.run_coroutine_threadsafe(self.session.close(), asyncio.get_event_loop())

    async def stop(self):
        await self.session.close()

    def __call__(self) -> ClientSession:
        return self.session


class AuthHttpClient(metaclass=Singleton):
    def __init__(self):
        conn = TCPConnector(ttl_dns_cache=60, limit=0)
        self.session = ClientSession(connector=conn)

    def __del__(self):
        asyncio.run_coroutine_threadsafe(self.session.close(), asyncio.get_event_loop())

    async def stop(self):
        await self.session.close()

    def __call__(self) -> ClientSession:
        return self.session
