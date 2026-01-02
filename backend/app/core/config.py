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
    
    # Mail Settings
    MAIL_USERNAME: Optional[str] = Field(default=None, alias="MAIL_USERNAME")
    MAIL_PASSWORD: Optional[str] = Field(default=None, alias="MAIL_PASSWORD")
    MAIL_FROM: str = Field(default="noreply@aqarak.com", alias="MAIL_FROM")
    MAIL_PORT: int = Field(default=587, alias="MAIL_PORT")
    MAIL_SERVER: str = Field(default="smtp.gmail.com", alias="MAIL_SERVER")
    FRONTEND_URL: str = Field(default="http://localhost:5173", alias="FRONTEND_URL")

    @property
    def stripped_mail_password(self) -> Optional[str]:
        return self.MAIL_PASSWORD.strip() if self.MAIL_PASSWORD else None

    @property
    def stripped_mail_username(self) -> Optional[str]:
        return self.MAIL_USERNAME.strip() if self.MAIL_USERNAME else None

    @property
    def stripped_mail_from(self) -> str:
        return self.MAIL_FROM.strip()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

def get_settings() -> "Settings":
    return Settings()

settings = get_settings()