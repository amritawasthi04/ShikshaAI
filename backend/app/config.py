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

    # AI Model Gateway & Google API
    GOOGLE_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    DEFAULT_MODEL: str = "gemini-2.5-flash"
    TEACHER_MODEL: str = "gemini-2.5-pro"
    JUDGE_MODEL: str = "gemini-2.5-pro"

    # Datastores
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_CORE_DB: str = "pathai_core"
    MONGODB_CHAT_DB: str = "pathai_chat"
    MONGODB_MAX_POOL_SIZE: int = 50
    MONGODB_MIN_POOL_SIZE: int = 5
    MONGODB_TIMEOUT_MS: int = 5000

    # Vector store (Chroma Cloud)
    CHROMA_HOST: str = "api.trychroma.com"
    CHROMA_API_KEY: str | None = None
    CHROMA_TENANT: str | None = None
    CHROMA_DATABASE: str = "default"
    CHROMA_PUBLIC_COLLECTION: str = "shiksha_public_knowledge"
    CHROMA_MAX_DOCUMENT_BYTES: int = 16384  # 16 KiB document limit

    REDIS_URL: str = "redis://localhost:6379/0"

    # Phase flag
    IS_READY: bool = True


settings = Settings()
