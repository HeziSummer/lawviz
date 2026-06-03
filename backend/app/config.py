from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="LawViz API", validation_alias="APP_NAME")
    app_version: str = "0.1.0"
    environment: str = Field(default="local", validation_alias="APP_ENV")
    debug: bool = True
    api_prefix: str = "/api"

    database_url: str = Field(
        default="postgresql+psycopg2://lawviz:lawviz_local_dev_password@127.0.0.1:5433/lawviz",
        validation_alias="DATABASE_URL",
    )
    jwt_secret: str = Field(default="replace-with-local-development-secret", validation_alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=1440, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    sms_provider: str = Field(default="console", validation_alias="SMS_PROVIDER")
    sms_dev_code: str | None = Field(default="123456", validation_alias="SMS_DEV_CODE")
    sms_code_ttl_minutes: int = Field(default=10, validation_alias="SMS_CODE_TTL_MINUTES")
    sms_resend_seconds: int = Field(default=60, validation_alias="SMS_RESEND_SECONDS")
    sms_hourly_limit: int = Field(default=5, validation_alias="SMS_HOURLY_LIMIT")
    sms_daily_limit: int = Field(default=20, validation_alias="SMS_DAILY_LIMIT")
    sms_max_attempts: int = Field(default=5, validation_alias="SMS_MAX_ATTEMPTS")
    sms_code_secret: str = Field(default="replace-with-local-sms-secret", validation_alias="SMS_CODE_SECRET")
    enable_live_payment: bool = Field(default=False, validation_alias="ENABLE_LIVE_PAYMENT")
    hupijiao_secret: str | None = Field(default=None, validation_alias="HUPIJIAO_SECRET")
    new_api_base_url: str | None = Field(default=None, validation_alias="NEW_API_BASE_URL")
    new_api_key: str | None = Field(default=None, validation_alias="NEW_API_KEY")
    new_api_default_model: str = Field(default="gpt-5.5", validation_alias="NEW_API_DEFAULT_MODEL")
    new_api_claude_base_url: str | None = Field(default=None, validation_alias="NEW_API_CLAUDE_BASE_URL")
    new_api_claude_key: str | None = Field(default=None, validation_alias="NEW_API_CLAUDE_KEY")
    new_api_claude_model: str = Field(default="claude-opus-4-7", validation_alias="NEW_API_CLAUDE_MODEL")
    new_api_timeout_seconds: int = Field(default=60, validation_alias="NEW_API_TIMEOUT_SECONDS")

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
