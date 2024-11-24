from fastapi import APIRouter
from fastapi.responses import UJSONResponse

hc = APIRouter()


@hc.get("/health-check", response_class=UJSONResponse)
async def health_check_handler():
    return None
