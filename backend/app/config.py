from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENV: Literal["development", "staging", "production"] = "development"
    APP_NAME: str = "PathAI (Shiksha)"
    API_V1_PREFIX: str = "/api/v1"

    # Datastores
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_CORE_DB: str = "pathai_core"
    MONGODB_CHAT_DB: str = "pathai_chat"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    REDIS_URL: str = "redis://localhost:6379/0"

    # Phase 0 flag: Readiness intentionally returns 503 until live datastores and services are connected
    IS_READY: bool = False


settings = Settings()
