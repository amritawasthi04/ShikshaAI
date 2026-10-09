from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router

logger = logging.getLogger("pathai.main")


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Manage application startup and shutdown lifecycle."""
    logger.info("PathAI Backend starting up...")
    try:
        from app.db.connection import mongo_manager
        from app.db.chroma_client import chroma_manager
        await mongo_manager.ping()
        chroma_manager.ping()
    except Exception as e:
        logger.warning("Datastore startup notice: %s", e)
    yield
    try:
        from app.db.connection import mongo_manager
        mongo_manager.close()
    except Exception as e:
        logger.warning("Datastore shutdown notice: %s", e)


def create_app() -> FastAPI:
    """Factory function for FastAPI application."""
    application = FastAPI(
        title=settings.APP_NAME,
        description="PathAI (Shiksha) Teacher Brain and Agentic Learning System",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Configure CORS for client connectivity
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Attach Request Lifecycle & Tracing Middleware
    from app.middleware.context import RequestContextMiddleware
    application.add_middleware(RequestContextMiddleware)

    # Register global sanitized error handlers (Section 12)
    from app.core.errors.handlers import register_error_handlers
    register_error_handlers(application)

    # Attach versioned routers
    application.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    # Root route for quick health ping
    @application.get("/")
    async def root():
        return {
            "app": settings.APP_NAME,
            "version": "0.1.0",
            "phase": "Phase 1 - Foundation",
            "docs": "/docs",
        }

    return application


app = create_app()
