"""Application settings loaded from environment / .env (never hard-code secrets)."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
APP_VERSION = "0.1.0"
API_VERSION = "v1"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    model_path: Path = Field(default=PROJECT_ROOT / "ml" / "artifacts", alias="MODEL_PATH")
    dataset_path: Path = Field(
        default=PROJECT_ROOT / "data" / "raw" / "location_aware_gis_leakage_dataset.csv",
        alias="DATASET_PATH",
    )

    # LLM provider abstraction - configured but not used in Phase 1.
    ai_provider: str | None = Field(default=None, alias="AI_PROVIDER")
    ai_model: str | None = Field(default=None, alias="AI_MODEL")
    ai_api_key: str | None = Field(default=None, alias="AI_API_KEY")

    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")

    def model_post_init(self, __context) -> None:  # resolve relative paths against the repo root
        for name in ("model_path", "dataset_path"):
            v = getattr(self, name)
            if not v.is_absolute():
                object.__setattr__(self, name, (PROJECT_ROOT / v).resolve())

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
