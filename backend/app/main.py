"""FastAPI main application bootstrap."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router


def create_app() -> FastAPI:
    """Factory function for FastAPI application."""
    application = FastAPI(
        title=settings.APP_NAME,
        description="PathAI (Shiksha) Teacher Brain and Agentic Learning System",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS for client connectivity
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Attach versioned routers
    application.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    # Root route for quick health ping
    @application.get("/")
    async def root():
        return {
            "app": settings.APP_NAME,
            "version": "0.1.0",
            "phase": "Phase 0 - Scaffold",
            "docs": "/docs",
        }

    return application


app = create_app()
