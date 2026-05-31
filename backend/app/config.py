from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "LawViz API"
    app_version: str = "0.1.0"
    environment: str = "local"
    debug: bool = True
    api_prefix: str = "/api"

    database_url: str = Field(
        default="postgresql+psycopg2://lawviz:lawviz_local_dev_password@127.0.0.1:5433/lawviz",
        validation_alias="DATABASE_URL",
    )

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
