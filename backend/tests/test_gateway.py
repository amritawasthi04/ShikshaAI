"""Tests for ModelGateway configuration, structured parsing, and multi-key quota fallback."""
import pytest
from pydantic import BaseModel
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.llm.gateway import ModelGateway, mask_key, _is_quota_or_rate_limit_error


class DummyResponseSchema(BaseModel):
    message: str
    confidence: float


def test_mask_key():
    assert mask_key(None) == "None"
    assert mask_key("short") == "***"
    masked = mask_key("sample_secret_key_1234567890_test")
    assert masked.startswith("sample")
    assert masked.endswith("test")
    assert "..." in masked
    assert "secret_key" not in masked


def test_is_quota_error_detection():
    # String pattern matching
    assert _is_quota_or_rate_limit_error(Exception("429 Resource Exhausted")) is True
    assert _is_quota_or_rate_limit_error(Exception("quota exceeded for model")) is True
    assert _is_quota_or_rate_limit_error(Exception("Rate limit reached: too many requests")) is True
    assert _is_quota_or_rate_limit_error(ValueError("Invalid syntax")) is False

    # Object with status_code attribute
    mock_err = MagicMock()
    mock_err.status_code = 429
    assert _is_quota_or_rate_limit_error(mock_err) is True


@pytest.mark.asyncio
async def test_gateway_initialization():
    gw = ModelGateway(api_key="test-api-key")
    assert gw.is_available is True
    assert gw.key_count == 1
    assert gw.api_key == "test-api-key"


@pytest.mark.asyncio
async def test_gateway_multi_key_initialization():
    keys = ["key-alpha-12345", "key-beta-67890", "key-alpha-12345"]  # includes duplicate
    gw = ModelGateway(api_keys=keys)
    assert gw.is_available is True
    assert gw.key_count == 2  # deduplicated
    assert gw.api_keys == ["key-alpha-12345", "key-beta-67890"]
    assert gw.active_key_index == 0
    assert gw.api_key == "key-alpha-12345"

    gw.rotate_key()
    assert gw.active_key_index == 1
    assert gw.api_key == "key-beta-67890"

    gw.rotate_key()
    assert gw.active_key_index == 0


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


@pytest.mark.asyncio
async def test_gateway_quota_fallback_on_429_generate_structured():
    gw = ModelGateway(api_keys=["primary-key-1", "fallback-key-2"])
    assert gw.key_count == 2
    assert gw.active_key_index == 0

    # Primary client raises 429 Quota Exceeded error
    mock_client_1 = MagicMock()
    mock_client_1.aio.models.generate_content = AsyncMock(
        side_effect=Exception("429 RESOURCE_EXHAUSTED: Quota exceeded for project")
    )

    # Fallback client succeeds
    mock_response_2 = MagicMock()
    mock_response_2.text = '{"message": "Recovered with fallback key", "confidence": 0.95}'
    mock_client_2 = MagicMock()
    mock_client_2.aio.models.generate_content = AsyncMock(return_value=mock_response_2)

    gw._clients = [mock_client_1, mock_client_2]

    result = await gw.generate_structured(
        prompt="Test quota failover",
        response_schema=DummyResponseSchema,
    )

    # Assert successful structured result obtained from fallback key
    assert isinstance(result, DummyResponseSchema)
    assert result.message == "Recovered with fallback key"
    # Assert active key has rotated to index 1 (fallback key)
    assert gw.active_key_index == 1
    assert gw.api_key == "fallback-key-2"


@pytest.mark.asyncio
async def test_gateway_quota_fallback_on_429_generate_text():
    gw = ModelGateway(api_keys=["key-1", "key-2"])
    
    mock_client_1 = MagicMock()
    mock_client_1.aio.models.generate_content = AsyncMock(
        side_effect=Exception("ResourceExhausted: 429 Quota exceeded")
    )

    mock_response_2 = MagicMock()
    mock_response_2.text = "Hello from fallback key!"
    mock_client_2 = MagicMock()
    mock_client_2.aio.models.generate_content = AsyncMock(return_value=mock_response_2)

    gw._clients = [mock_client_1, mock_client_2]

    text = await gw.generate_text("Say hello")
    assert text == "Hello from fallback key!"
    assert gw.active_key_index == 1


@pytest.mark.asyncio
async def test_gateway_all_keys_exhausted():
    gw = ModelGateway(api_keys=["key-1", "key-2"])

    mock_client_1 = MagicMock()
    mock_client_1.aio.models.generate_content = AsyncMock(
        side_effect=Exception("429 RESOURCE_EXHAUSTED on key 1")
    )
    mock_client_2 = MagicMock()
    mock_client_2.aio.models.generate_content = AsyncMock(
        side_effect=Exception("429 RESOURCE_EXHAUSTED on key 2")
    )

    gw._clients = [mock_client_1, mock_client_2]

    with pytest.raises(Exception) as exc_info:
        await gw.generate_text("Prompt that fails everywhere")

    assert "429" in str(exc_info.value)
