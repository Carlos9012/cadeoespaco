from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    turso_database_url: str = "file:local.db"
    turso_auth_token: str = ""

    jwt_secret: str = "troque-este-segredo"
    jwt_algorithm: str = "HS256"
    jwt_expira_minutos: int = 480

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
