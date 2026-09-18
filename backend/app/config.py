from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/aurarisk_ai"
    API_BASE_URL: str = "http://localhost:8000"
    MODEL_PATH: str = "./ml/artifacts"
    LOG_LEVEL: str = "INFO"
    AI_PROVIDER: str = "groq"
    AI_MODEL: str = "llama3-8b-8192"
    AI_API_KEY: str = ""

    # Added fields to support the requested XAMPP environment variables
    APP_ENV: str = "development"
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    DATABASE_HOST: str = "127.0.0.1"
    DATABASE_PORT: int = 3306
    DATABASE_NAME: str = "aurarisk_ai"
    DATABASE_USER: str = "root"
    DATABASE_PASSWORD: str = ""
    VITE_API_BASE_URL: str = "http://127.0.0.1:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
