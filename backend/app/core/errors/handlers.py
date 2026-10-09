"""Global exception handlers ensuring all public errors match Section 12 specifications."""
import logging
import uuid
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_500_INTERNAL_SERVER_ERROR

from app.core.errors.exceptions import PathAIException
from app.core.errors.models import ErrorDetail, ErrorResponse

logger = logging.getLogger(__name__)


def get_request_id(request: Request) -> str:
    return getattr(request.state, "request_id", str(uuid.uuid4()))


async def pathai_exception_handler(request: Request, exc: PathAIException) -> JSONResponse:
    request_id = get_request_id(request)
    logger.warning(
        f"Handled PathAIException [{exc.error_code}] on {request.method} {request.url.path} (request_id={request_id}): {exc.message}"
    )
    error_response = ErrorResponse(
        error_code=exc.error_code,
        message=exc.message,
        retryable=exc.retryable,
        request_id=request_id,
        details=exc.details if exc.details else None,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(exclude_none=True),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = get_request_id(request)
    details = [
        ErrorDetail(
            field=".".join(str(loc) for loc in err.get("loc", []) if loc != "body"),
            issue=err.get("msg", "Invalid input value"),
        )
        for err in exc.errors()
    ]
    error_response = ErrorResponse(
        error_code="VALIDATION_ERROR",
        message="Request validation failed. Check parameter types and required fields.",
        retryable=False,
        request_id=request_id,
        details=details,
    )
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump(exclude_none=True),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = get_request_id(request)
    # Log internal traceback safely on the server side
    logger.error(
        f"Unhandled server error on {request.method} {request.url.path} (request_id={request_id})",
        exc_info=exc,
    )
    # Public response strictly omits stack traces, DB strings, and internal model errors
    error_response = ErrorResponse(
        error_code="INTERNAL_ERROR",
        message="An unexpected internal error occurred. Please contact support with the request ID.",
        retryable=True,
        request_id=request_id,
        details=None,
    )
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(exclude_none=True),
    )


def register_error_handlers(app: FastAPI) -> None:
    """Registers standard error handlers with the FastAPI application."""
    app.add_exception_handler(PathAIException, pathai_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
