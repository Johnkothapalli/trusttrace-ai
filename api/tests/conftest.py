from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(
        app_env="test",
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        cors_origins="http://localhost:3000,https://portfolio.example",
        ingest_api_key="test-ingest-key",
        admin_api_key="test-admin-key",
        seed_demo_data=True,
    )


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as test_client:
        yield test_client


@pytest.fixture
def ingest_headers() -> dict[str, str]:
    return {"X-TrustTrace-Key": "test-ingest-key"}


@pytest.fixture
def admin_headers() -> dict[str, str]:
    return {"X-Admin-Key": "test-admin-key"}
