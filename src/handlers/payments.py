from fastapi import APIRouter
from fastapi.responses import UJSONResponse

payments_router = APIRouter()


@payments_router.get("/payments", response_class=UJSONResponse)
async def payments_handler():
    service = PaymentService(payment: PaymentInput)
    return await service.offers()

