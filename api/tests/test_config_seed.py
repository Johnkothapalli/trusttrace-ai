from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.seed import seed_database


def test_production_rejects_default_keys() -> None:
    with pytest.raises(ValidationError, match="non-demo API keys"):
        Settings(app_env="production")


def test_production_rejects_identical_keys() -> None:
    shared_key = "x" * 40
    with pytest.raises(ValidationError, match="distinct ingestion"):
        Settings(
            app_env="production",
            ingest_api_key=shared_key,
            admin_api_key=shared_key,
            public_demo_reads=False,
        )


def test_production_rejects_public_demo_reads() -> None:
    with pytest.raises(ValidationError, match="Disable public demo reads"):
        Settings(
            app_env="production",
            ingest_api_key="i" * 40,
            admin_api_key="a" * 40,
        )


def test_production_rejects_synthetic_seed_data() -> None:
    with pytest.raises(ValidationError, match="Disable synthetic demo seeding"):
        Settings(
            app_env="production",
            ingest_api_key="i" * 40,
            admin_api_key="a" * 40,
            public_demo_reads=False,
        )


def test_explicit_production_settings_are_valid() -> None:
    settings = Settings(
        app_env="production",
        ingest_api_key="i" * 40,
        admin_api_key="a" * 40,
        public_demo_reads=False,
        seed_demo_data=False,
    )
    assert settings.app_env == "production"


def test_allowed_origins_are_normalized() -> None:
    settings = Settings(cors_origins=" http://localhost:3000/, https://example.test/ ")
    assert settings.allowed_origins == ["http://localhost:3000", "https://example.test"]


def test_seeding_is_idempotent(client, settings: Settings) -> None:  # type: ignore[no-untyped-def]
    inserted = seed_database(client.app.state.session_factory, settings)
    assert inserted == 0
    assert client.get("/api/v1/overview").json()["total_traces"] == 8
