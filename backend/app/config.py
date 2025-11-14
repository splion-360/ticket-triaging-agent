import logging
import os
from typing import Literal

from dotenv import load_dotenv
from openai import AsyncOpenAI
from pydantic_settings import BaseSettings


load_dotenv()


class Settings(BaseSettings):
    database_url: str = os.environ.get("DATABASE_URL")
    environment: str = os.environ.get("ENVIRONMENT", "development")


settings = Settings()

_async_openai_client: AsyncOpenAI | None = None

LLM_API_KEY = os.environ.get("LLM_API_KEY")
MODEL = "gemma3"  # "openai/gpt-oss-20b:free"
API_URL = "http://host.docker.internal:11434/v1"  # "https://openrouter.ai/api/v1"
TEMPERATURE = 0.1
MAX_TOKENS = 1000
SUMMARY_TOKENS = 150
MAX_CONCURRENT_REQUESTS = 3
LOG_COLORS = {
    "RED": "\033[31m",
    "GREEN": "\033[32m",
    "YELLOW": "\033[33m",
    "BLUE": "\033[34m",
    "MAGENTA": "\033[35m",
    "CYAN": "\033[36m",
    "WHITE": "\033[37m",
    "BRIGHT_RED": "\033[91m",
    "BRIGHT_GREEN": "\033[92m",
    "BRIGHT_YELLOW": "\033[93m",
    "RESET": "\033[0m",
}

ColorType = Literal[
    "RED",
    "GREEN",
    "YELLOW",
    "BLUE",
    "MAGENTA",
    "CYAN",
    "WHITE",
    "BRIGHT_RED",
    "BRIGHT_GREEN",
    "BRIGHT_YELLOW",
]


class ColoredFormatter(logging.Formatter):
    def __init__(self, fmt: str):
        super().__init__(fmt)
        self.colors = {
            logging.DEBUG: "BRIGHT_YELLOW",
            logging.INFO: "GREEN",
            logging.WARNING: "YELLOW",
            logging.ERROR: "RED",
            logging.CRITICAL: "BRIGHT_RED",
        }

    def format(self, record):
        message = super().format(record)
        if hasattr(record, "custom_color") and record.custom_color:
            color = record.custom_color
        else:
            color = self.colors.get(record.levelno, "WHITE")
        return f"{LOG_COLORS[color]}{message}{LOG_COLORS['RESET']}"


class CustomLogger:
    def __init__(self, logger: logging.Logger):
        self._logger = logger

    def info(self, message: str, color: ColorType = None):
        record = self._logger.makeRecord(
            self._logger.name, logging.INFO, "", 0, message, (), None
        )
        if color:
            record.custom_color = color
        self._logger.handle(record)

    def debug(self, message: str, color: ColorType = None):
        record = self._logger.makeRecord(
            self._logger.name, logging.DEBUG, "", 0, message, (), None
        )
        if color:
            record.custom_color = color
        self._logger.handle(record)

    def warning(self, message: str, color: ColorType = None):
        record = self._logger.makeRecord(
            self._logger.name, logging.WARNING, "", 0, message, (), None
        )
        if color:
            record.custom_color = color
        self._logger.handle(record)

    def error(self, message: str, color: ColorType = None):
        record = self._logger.makeRecord(
            self._logger.name, logging.ERROR, "", 0, message, (), None
        )
        if color:
            record.custom_color = color
        self._logger.handle(record)

    def __getattr__(self, name):
        return getattr(self._logger, name)


def setup_logger(name: str = __name__) -> CustomLogger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return CustomLogger(logger)

    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    formatter = ColoredFormatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

    return CustomLogger(logger)


def get_async_openai_client() -> AsyncOpenAI:
    global _async_openai_client

    if not LLM_API_KEY:
        raise ValueError("Invalid API Key provided")

    if not _async_openai_client:
        _async_openai_client = AsyncOpenAI(
            base_url=API_URL,
            api_key="ollama-api-key",
        )
    return _async_openai_client
