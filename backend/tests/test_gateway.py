"""Tests for ModelGateway configuration and structured output parsing."""
import pytest
from pydantic import BaseModel
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.llm.gateway import ModelGateway


class DummyResponseSchema(BaseModel):
    message: str
    confidence: float


@pytest.mark.asyncio
async def test_gateway_initialization():
    gw = ModelGateway(api_key="test-api-key")
    assert gw.is_available is True


@pytest.mark.asyncio
async def test_gateway_generate_structured_mocked():
    gw = ModelGateway(api_key="test-api-key")
    mock_response = MagicMock()
    mock_response.text = '{"message": "Ready to teach", "confidence": 0.99}'

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
    gw._client = mock_client

    result = await gw.generate_structured(
        prompt="Check readiness",
        response_schema=DummyResponseSchema,
    )
    assert isinstance(result, DummyResponseSchema)
    assert result.message == "Ready to teach"
    assert result.confidence == 0.99
