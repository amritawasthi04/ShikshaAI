"""Request lifecycle middleware managing Request ID tracing and execution timing."""
import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Middleware that injects and propagates X-Request-Id across the request lifecycle."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract incoming or generate fresh request ID
        incoming_id = request.headers.get("X-Request-Id")
        request_id = incoming_id if incoming_id else str(uuid.uuid4())

        # Attach to request state for access in endpoints and exception handlers
        request.state.request_id = request_id

        start_time = time.perf_counter()
        logger.info(f"--> [{request_id}] {request.method} {request.url.path}")

        try:
            response = await call_next(request)
        except Exception:
            # Let global exception handlers format the error response
            raise
        finally:
            duration_ms = (time.perf_counter() - start_time) * 1000

        # Inject tracing headers into response
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.2f}"

        logger.info(
            f"<-- [{request_id}] {request.method} {request.url.path} "
            f"completed with status {response.status_code} in {duration_ms:.2f}ms"
        )
        return response
