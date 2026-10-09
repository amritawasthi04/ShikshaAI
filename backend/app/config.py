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

    # Vector store (Qdrant)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_URL: str | None = None
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION: str = "pathai_knowledge_passages"
    VECTOR_DIMENSION: int = 768

    REDIS_URL: str = "redis://localhost:6379/0"

    # Phase flag
    IS_READY: bool = False


settings = Settings()
