from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from `TRUSTTRACE_*` environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="TRUSTTRACE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "TrustTrace API"
    app_env: Literal["development", "test", "production"] = "development"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./trusttrace.db"
    cors_origins: str = "http://localhost:3000"
    ingest_api_key: SecretStr = SecretStr("tt_demo_ingest_change_me")
    admin_api_key: SecretStr = SecretStr("tt_demo_admin_change_me")
    demo_workspace_id: str = "ws_demo"
    seed_demo_data: bool = True
    public_demo_reads: bool = True
    log_level: str = "INFO"

    @field_validator("cors_origins")
    @classmethod
    def strip_origins(cls, value: str) -> str:
        return ",".join(origin.strip().rstrip("/") for origin in value.split(",") if origin.strip())

    @field_validator("api_prefix")
    @classmethod
    def validate_prefix(cls, value: str) -> str:
        if not value.startswith("/"):
            raise ValueError("api_prefix must start with '/'")
        return value.rstrip("/")

    @model_validator(mode="after")
    def reject_demo_secrets_in_production(self) -> Settings:
        if self.app_env == "production":
            secrets = [
                self.ingest_api_key.get_secret_value(),
                self.admin_api_key.get_secret_value(),
            ]
            if any(len(value) < 32 or value.endswith("_change_me") for value in secrets):
                raise ValueError(
                    "Set distinct, non-demo API keys of at least 32 characters in production"
                )
            if secrets[0] == secrets[1]:
                raise ValueError("Use distinct ingestion and administrator API keys in production")
            if self.public_demo_reads:
                raise ValueError("Disable public demo reads before running in production")
            if self.seed_demo_data:
                raise ValueError("Disable synthetic demo seeding before running in production")
        return self

    @property
    def allowed_origins(self) -> list[str]:
        return [origin for origin in self.cors_origins.split(",") if origin]


@lru_cache
def get_settings() -> Settings:
    return Settings()
