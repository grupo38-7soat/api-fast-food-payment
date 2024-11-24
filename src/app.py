import uvicorn
from fastapi import FastAPI


from src import __version__
from src.settings import BASE_PATH, HOST, PORT, WORKERS, DD_TRACE_SERVICE, AUTO_RELOAD

app = FastAPI(
    title="Payments",
    version=__version__,
    description="Serviço de Integração com Mercado Pago",
    openapi_url=f"{BASE_PATH}/openapi.json",
    docs_url=f"{BASE_PATH}/docs",
    redoc_url=f"{BASE_PATH}/redoc",
)

app.include_router(payments_router, prefix=BASE_PATH)
app.include_router(hc, prefix=BASE_PATH)

if __name__ == "__main__":
    uvicorn.run(
        "src.app:app",
    )
