from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.avatar.router import router as avatar_router
from app.cart.router import router as cart_router
from app.core.config import CORS_ORIGINS
from app.products.router import router as products_router

app = FastAPI(title="food-3d-manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(avatar_router)
app.include_router(products_router)
app.include_router(cart_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
