"""
Environment configuration — loaded from .env
Never hardcode secrets. Use python-dotenv + pydantic-settings.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Tool Gateway (apps/api)
    tool_gateway_url: str = "http://localhost:3000"

    # AI service
    ai_service_port: int = 8000

    # Optional: LLM provider keys (add as needed)
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Optional: Vector store
    # pgvector uses the main postgres connection from apps/api
    # If using a dedicated vector DB:
    qdrant_url: str = ""
    pinecone_api_key: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
