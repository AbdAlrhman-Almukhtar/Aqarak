from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DB_URL: str = Field(alias="DATABASE_URL")
    AUTH_SECRET: str = Field(alias="AUTH_SECRET")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_ALG: str = Field(default="HS256", alias="JWT_ALG")
    REDIS_URL: Optional[str] = Field(default=None, alias="REDIS_URL")
    CORS_ORIGINS: str = Field(default="*", alias="CORS_ORIGINS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

def get_settings() -> "Settings":
    return Settings()

settings = get_settings()