from __future__ import annotations

import hmac
from typing import Annotated

from fastapi import HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader

from app.config import Settings

ingest_key_header = APIKeyHeader(
    name="X-TrustTrace-Key",
    scheme_name="TrustTraceIngestKey",
    description="Workspace ingestion key. Replace the documented demo value outside development.",
    auto_error=False,
)
admin_key_header = APIKeyHeader(
    name="X-Admin-Key",
    scheme_name="TrustTraceAdminKey",
    description="Administrator key for review mutations and protected reads.",
    auto_error=False,
)


def get_app_settings(request: Request) -> Settings:
    return request.app.state.settings


def _authorize(provided: str | None, expected: str, header_name: str) -> None:
    authorized = False
    if provided:
        try:
            authorized = hmac.compare_digest(provided, expected)
        except TypeError:
            # compare_digest rejects non-ASCII strings; malformed headers are authentication
            # failures, not server errors.
            authorized = False
    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"A valid {header_name} header is required.",
            headers={"WWW-Authenticate": "ApiKey"},
        )


def require_ingest_key(
    request: Request,
    key: Annotated[str | None, Security(ingest_key_header)] = None,
) -> str:
    settings = get_app_settings(request)
    _authorize(key, settings.ingest_api_key.get_secret_value(), "X-TrustTrace-Key")
    return "api-client"


def require_admin_key(
    request: Request,
    key: Annotated[str | None, Security(admin_key_header)] = None,
) -> str:
    settings = get_app_settings(request)
    _authorize(key, settings.admin_api_key.get_secret_value(), "X-Admin-Key")
    return "workspace-admin"


def require_read_access(
    request: Request,
    key: Annotated[str | None, Security(admin_key_header)] = None,
) -> str:
    """Allow the synthetic demo workspace publicly; protect reads in non-demo deployments."""

    settings = get_app_settings(request)
    if settings.public_demo_reads:
        return "public-demo"
    _authorize(key, settings.admin_api_key.get_secret_value(), "X-Admin-Key")
    return "workspace-admin"
