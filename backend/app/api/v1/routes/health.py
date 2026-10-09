"""Health and readiness probe endpoints."""
from fastapi import APIRouter, Response, status
from app.config import settings
from app.core.schemas.base import utc_now

router = APIRouter(tags=["Health"])


@router.get("/healthz", status_code=status.HTTP_200_OK)
async def liveness_probe():
    """Liveness probe confirming the API process is alive."""
    return {
        "status": "alive",
        "app": settings.APP_NAME,
        "timestamp": utc_now().isoformat(),
    }


@router.get("/readyz")
async def readiness_probe(response: Response):
    """Readiness probe.

    Per Phase 0 specification, readiness intentionally returns 503 Service
    Unavailable until live datastores and external dependencies are connected.
    """
    if not settings.IS_READY:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "phase": "Phase 0 - Scaffold",
            "detail": "Live databases and model gateways pending Phase 1/2 integration",
        }

    response.status_code = status.HTTP_200_OK
    return {
        "status": "ready",
        "detail": "All systems operational",
    }
