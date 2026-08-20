from __future__ import annotations

import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.config import Settings, get_settings
from app.database import Base, create_database
from app.routes import audit, evaluations, health, overview, reviews, traces
from app.seed import seed_database

API_DESCRIPTION = """
TrustTrace stores LLM application traces, applies an **explainable deterministic rule set**,
and routes flagged records to human review. Guardrail findings include a rule code, severity,
location, redacted evidence, and confidence assigned to that rule. No endpoint claims these
heuristics are an AI judge or a substitute for a production safety program.

Write operations use separate ingestion and administrator API-key headers. The seeded demo
workspace permits anonymous reads only while `public_demo_reads` is enabled. Production settings
reject that mode; add a managed identity layer before handling real trace data.
"""


def create_app(settings: Settings | None = None) -> FastAPI:
    runtime_settings = settings or get_settings()
    engine, factory = create_database(runtime_settings.database_url)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        Base.metadata.create_all(engine)
        if runtime_settings.seed_demo_data:
            seed_database(factory, runtime_settings)
        yield
        engine.dispose()

    application = FastAPI(
        title=runtime_settings.app_name,
        summary="Operational guardrails and human review for AI application traces",
        description=API_DESCRIPTION,
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        contact={
            "name": "TrustTrace",
            "url": "https://github.com/Johnkothapalli/trusttrace-ai",
        },
        license_info={"name": "MIT"},
    )
    application.state.settings = runtime_settings
    application.state.engine = engine
    application.state.session_factory = factory

    application.add_middleware(
        CORSMiddleware,
        allow_origins=runtime_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["Accept", "Content-Type", "X-Admin-Key", "X-TrustTrace-Key"],
        expose_headers=["X-Request-ID", "X-Response-Time-Ms"],
    )

    @application.middleware("http")
    async def request_context(request: Request, call_next):  # type: ignore[no-untyped-def]
        started = time.perf_counter()
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))[:128]
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{(time.perf_counter() - started) * 1000:.1f}"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @application.get("/", include_in_schema=False)
    def root() -> JSONResponse:
        return JSONResponse(
            {
                "service": runtime_settings.app_name,
                "version": __version__,
                "docs": "/docs",
                "health": "/health",
            }
        )

    api_routers = (
        health.router,
        overview.router,
        traces.router,
        reviews.router,
        evaluations.router,
        audit.router,
    )
    for route in api_routers:
        application.include_router(route, prefix=runtime_settings.api_prefix)

    # Keep a conventional unprefixed readiness probe for containers and hosting platforms.
    application.include_router(health.router)
    return application


app = create_app()


def run() -> None:
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.app_env == "development",
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    run()
