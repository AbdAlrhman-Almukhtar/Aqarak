import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
app = FastAPI(title="Aqarak API", version="0.1.0")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
import redis.asyncio as redis
from fastapi_limiter import FastAPILimiter
@app.on_event("startup")
async def startup():
    r = redis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(r)
from app.api.ml_price_router import router as ml_price_router
app.include_router(ml_price_router)
from app.api.auth import router as auth_router
app.include_router(auth_router)
from app.api.users import router as user_router
app.include_router(user_router)
from app.api.properties import router as property_router
app.include_router(property_router)
from app.api.favorites import router as favorite_router
app.include_router(favorite_router)
from app.api.uploads import router as uploads_router
app.include_router(uploads_router)
if os.getenv("OPENAI_API_KEY"):
    from app.api.docs import router as docs_router
    app.include_router(docs_router)

    from app.api.chat import router as chat_router
    app.include_router(chat_router)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def root():
    return {"ok": True}

@app.get("/health")
def health():
    return {"status": "ok"}