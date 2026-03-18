from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, stores, reviews, payments
from app.core.database import engine, Base

app = FastAPI(title="ReviewFit API", version="0.1.0")

import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(reviews.router)
app.include_router(payments.router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok"}
