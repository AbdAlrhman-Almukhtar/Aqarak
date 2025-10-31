from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
import logging
from app.api import users, properties, chat, auth
from app.core.config import settings
app = FastAPI(title="Aqarak API")
allow_origins = (
    ["*"] if settings.CORS_ORIGINS.strip() == "*" else [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(properties.router)
app.include_router(chat.router)
@app.on_event("startup")
async def _init_rate_limiter():
    url = settings.REDIS_URL or "redis://localhost:6379/0"
    try:
        r = redis.from_url(url, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(r)
        logging.info("Rate limiter initialized with %s", url)
    except Exception as e:
        logging.warning("Rate limiter disabled: %s", e)

@app.get("/health")
def health():
    return {"ok": True}