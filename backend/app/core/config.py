from pydantic_settings import BaseSettings
from typing import List, Optional



class Settings(BaseSettings):
    PROJECT_NAME: str = "HackChange API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./hackchange.db"

    # OpenAI / LLM
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0.4
    OPENAI_MAX_TOKENS: int = 256

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
