from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    turso_database_url: str
    turso_auth_token: str

    jwt_secret: str = "troque-este-segredo"
    jwt_algorithm: str = "HS256"
    jwt_expira_minutos: int = 480

    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:8080,http://localhost:8081"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # <--- ISSO RESOLVE O ERRO
    )

settings = Settings()
