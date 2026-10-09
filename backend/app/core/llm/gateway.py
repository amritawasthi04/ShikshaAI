"""Model gateway integrating Google GenAI with structured output and fallback support."""
import json
import logging
from typing import Any, Dict, List, Optional, Type, TypeVar, Union
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def _sanitize_schema(d: Any) -> Any:
    """Recursively removes additionalProperties which are unsupported in Gemini Developer API mode."""
    if isinstance(d, dict):
        d.pop("additionalProperties", None)
        for v in list(d.values()):
            _sanitize_schema(v)
    elif isinstance(d, list):
        for v in d:
            _sanitize_schema(v)
    return d


def mask_key(k: Optional[str]) -> str:
    """Masks an API key for safe logging, showing only prefix and suffix."""
    if not k:
        return "None"
    if len(k) <= 8:
        return "***"
    return f"{k[:6]}...{k[-4:]}"


def _is_quota_or_rate_limit_error(exc: Exception) -> bool:
    """Determines whether an exception is due to API quota exhaustion or rate limiting."""
    try:
        from google.genai.errors import APIError
        if isinstance(exc, APIError):
            if exc.code == 429:
                return True
            if exc.status and "RESOURCE_EXHAUSTED" in str(exc.status).upper():
                return True
    except ImportError:
        pass

    # Check status_code or code attribute
    status_code = getattr(exc, "status_code", getattr(exc, "code", None))
    if status_code == 429:
        return True

    # Check message text for quota / rate-limiting indicators
    err_str = str(exc).lower()
    quota_keywords = [
        "429",
        "resource_exhausted",
        "resource exhausted",
        "quota exceeded",
        "quota",
        "rate limit",
        "rate_limit",
        "too many requests",
    ]
    return any(keyword in err_str for keyword in quota_keywords)


class ModelGateway:
    """Manages interactions with hosted LLMs, supporting structured generation and multi-key quota rotation."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_keys: Optional[Union[List[str], str]] = None,
    ):
        self._keys: list[str] = []
        self._clients: list[Any] = []
        self._active_idx: int = 0

        # Collect raw keys
        raw_keys: list[str] = []
        if api_keys:
            if isinstance(api_keys, str):
                raw_keys.extend([k.strip() for k in api_keys.split(",") if k.strip()])
            elif isinstance(api_keys, (list, tuple, set)):
                raw_keys.extend([str(k).strip() for k in api_keys if str(k).strip()])
        if api_key and api_key.strip():
            raw_keys.append(api_key.strip())

        if not raw_keys:
            raw_keys = settings.api_keys

        # Deduplicate preserving order
        for k in raw_keys:
            if k and k not in self._keys:
                self._keys.append(k)

        # Initialize clients for each key
        if self._keys:
            try:
                from google import genai
                for k in list(self._keys):
                    try:
                        client = genai.Client(api_key=k)
                        self._clients.append(client)
                    except Exception as e:
                        logger.warning(f"Failed to initialize Google GenAI client for key {mask_key(k)}: {e}")
                        self._keys.remove(k)
            except Exception as e:
                logger.warning(f"Google GenAI SDK unavailable during initialization: {e}")

    @property
    def api_key(self) -> Optional[str]:
        """Returns the currently active API key."""
        if self._keys and 0 <= self._active_idx < len(self._keys):
            return self._keys[self._active_idx]
        return None

    @property
    def api_keys(self) -> list[str]:
        """Returns all configured API keys in the pool."""
        return list(self._keys)

    @property
    def active_key_index(self) -> int:
        """Returns the index of the currently active key."""
        return self._active_idx

    @property
    def key_count(self) -> int:
        """Returns the number of active clients in the key pool."""
        return len(self._clients)

    @property
    def is_available(self) -> bool:
        return len(self._clients) > 0

    @property
    def _client(self) -> Any:
        if self._clients and 0 <= self._active_idx < len(self._clients):
            return self._clients[self._active_idx]
        return None

    @_client.setter
    def _client(self, value: Any) -> None:
        """Allows direct client injection (e.g. for testing mocks)."""
        if self._clients and 0 <= self._active_idx < len(self._clients):
            self._clients[self._active_idx] = value
        else:
            self._clients = [value]
            if not self._keys:
                self._keys = [self.api_key or "mock-key"]
            self._active_idx = 0

    def rotate_key(self) -> Optional[str]:
        """Rotates to the next available API key in the pool and returns it."""
        if not self._clients:
            return None
        self._active_idx = (self._active_idx + 1) % len(self._clients)
        logger.info(
            f"Rotated ModelGateway active key to index {self._active_idx} "
            f"({mask_key(self.api_key)} of {len(self._clients)} keys)"
        )
        return self.api_key

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Generates raw text response from the model, rotating keys if quota is exhausted."""
        selected_model = model or settings.DEFAULT_MODEL
        if not self.is_available:
            raise RuntimeError("ModelGateway client is not configured with an API key")

        from google.genai import types

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
        )

        attempts = max(1, len(self._clients))
        last_error = None

        for attempt in range(attempts):
            client = self._client
            try:
                response = await client.aio.models.generate_content(
                    model=selected_model,
                    contents=prompt,
                    config=config,
                )
                return response.text or ""
            except Exception as e:
                last_error = e
                if _is_quota_or_rate_limit_error(e) and len(self._clients) > 1:
                    logger.warning(
                        f"LLM quota/rate limit reached on key {mask_key(self.api_key)}. "
                        f"Rotating to next key in pool (attempt {attempt + 1}/{attempts})."
                    )
                    self.rotate_key()
                    continue
                raise e

        raise last_error or RuntimeError("Failed to generate text across all configured API keys")

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """Generates validated structured response conforming to a Pydantic schema, rotating keys if quota is exhausted."""
        selected_model = model or settings.DEFAULT_MODEL
        if not self.is_available:
            raise RuntimeError("ModelGateway client is not configured with an API key")

        from google.genai import types

        # Sanitize schema for Gemini Developer API
        raw_schema = response_schema.model_json_schema()
        sanitized_schema = _sanitize_schema(raw_schema)

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=sanitized_schema,
        )

        attempts = max(1, len(self._clients))
        last_error = None

        for attempt in range(attempts):
            client = self._client
            try:
                response = await client.aio.models.generate_content(
                    model=selected_model,
                    contents=prompt,
                    config=config,
                )
                if not response.text:
                    raise ValueError("Empty response received from LLM")

                return response_schema.model_validate_json(response.text)
            except Exception as e:
                last_error = e
                if _is_quota_or_rate_limit_error(e) and len(self._clients) > 1:
                    logger.warning(
                        f"LLM quota/rate limit reached on key {mask_key(self.api_key)}. "
                        f"Rotating to next key in pool (attempt {attempt + 1}/{attempts})."
                    )
                    self.rotate_key()
                    continue
                raise e

        raise last_error or RuntimeError("Failed to generate structured output across all configured API keys")


# Global singleton instance
gateway = ModelGateway()
