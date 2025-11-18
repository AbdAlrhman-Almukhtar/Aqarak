import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
from app.core.config import settings
from app.db.session import engine, Base
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.properties import router as properties_router
from app.api.favorites import router as favorites_router
from app.api.uploads import router as uploads_router
from app.api.ml_price_router import router as ml_price_router

app = FastAPI(title="Aqarak API")
allow_origins = (
    ["*"]
    if settings.CORS_ORIGINS.strip() == "*"
    else [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(properties_router)
app.include_router(favorites_router)
app.include_router(uploads_router)
app.include_router(ml_price_router)
if os.getenv("OPENAI_API_KEY"):
    from app.api.chat import router as chat_router
    app.include_router(chat_router)
    
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.on_event("startup")
def _bootstrap_db():
    try:
        with engine.begin() as c:
            c.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector")
            c.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    except Exception as e:
        logging.warning("Extension init skipped: %s", e)
    Base.metadata.create_all(bind=engine)
@app.on_event("startup")
async def _init_rate_limiter():
    url = settings.REDIS_URL or "redis://localhost:6379/0"
    try:
        r = redis.from_url(url, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(r)
        logging.info("Rate limiter initialized with %s", url)
    except Exception as e:
        logging.warning("Rate limiter disabled: %s", e)

@app.get("/")
def root():
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}