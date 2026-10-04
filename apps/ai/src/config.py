from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "dev"
    ai_service_name: str = "tavonza-ai"
    ai_agent_default_id: str = "waiter_ai_v1"
    ai_service_port: int = 8000

    # --- Internal platform boundary (backend / Tool Gateway) ---
    internal_api_base_url: str = "http://localhost:3000/internal"
    internal_api_service_token: str = ""

    # --- Model provider: Groq ---
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    groq_fallback_models: str = "openai/gpt-oss-20b,qwen/qwen3.8-27b"
    groq_timeout_seconds: float = 12.0
    groq_max_retries: int = 0
    groq_rate_limit_cooldown_seconds: float = 30.0

    # --- Alternative Model Providers ---
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # --- Cache / conversation state ---
    redis_url: str = "redis://localhost:6379/0"

    log_level: str = "info"

    # MUST be False in production. True = fixture data mode for dev only.
    dev_mode_mock_backend: bool = True

    # Comma-separated allowed CORS origins.
    allowed_origins: str = "*"

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parent.parent / ".env",
            Path(__file__).resolve().parent / ".env",
            ".env",
        ),
        extra="ignore",
    )


settings = Settings()
