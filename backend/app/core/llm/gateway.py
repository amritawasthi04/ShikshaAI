"""Model gateway integrating Google GenAI with structured output and fallback support."""
import json
import logging
from typing import Any, Dict, Optional, Type, TypeVar
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class ModelGateway:
    """Manages interactions with hosted LLMs, supporting structured generation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Generates raw text response from the model."""
        selected_model = model or settings.DEFAULT_MODEL
        if not self._client:
            raise RuntimeError("ModelGateway client is not configured with an API key")

        from google.genai import types

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
        )

        response = await self._client.aio.models.generate_content(
            model=selected_model,
            contents=prompt,
            config=config,
        )
        return response.text or ""

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """Generates validated structured response conforming to a Pydantic schema."""
        selected_model = model or settings.DEFAULT_MODEL
        if not self._client:
            raise RuntimeError("ModelGateway client is not configured with an API key")

        from google.genai import types

        config = types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
        )

        response = await self._client.aio.models.generate_content(
            model=selected_model,
            contents=prompt,
            config=config,
        )

        if not response.text:
            raise ValueError("Empty response received from LLM")

        # Parse and return validated Pydantic model
        return response_schema.model_validate_json(response.text)


# Global singleton instance
gateway = ModelGateway()
