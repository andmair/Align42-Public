"""Structured logging for Align42."""
import json
import logging
import sys
from datetime import datetime
from pathlib import Path


LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "align42.log"


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""

    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "user_email"):
            log_data["user_email"] = record.user_email
        if hasattr(record, "assessment_id"):
            log_data["assessment_id"] = record.assessment_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        return json.dumps(log_data)


def setup_logging(level=logging.INFO):
    """Configure structured logging."""
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # File handler (JSON format)
    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setLevel(level)
    file_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(file_handler)

    # Console handler (simple format)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    return logging.getLogger("align42")


logger = setup_logging()


def log_auth_attempt(email: str, success: bool, reason: str = ""):
    """Log authentication attempt."""
    logger.info(
        f"Auth attempt: {email} - {'SUCCESS' if success else 'FAILED'} {reason}",
        extra={"user_email": email},
    )


def log_assessment_action(user_email: str, assessment_id: int, action: str, details: str = ""):
    """Log assessment action."""
    logger.info(
        f"Assessment {action}: {details}",
        extra={"user_email": user_email, "assessment_id": assessment_id},
    )


def log_file_upload(user_email: str, assessment_id: int, filename: str, size: int, mime_type: str):
    """Log file upload."""
    logger.info(
        f"File uploaded: {filename} ({size} bytes, {mime_type})",
        extra={
            "user_email": user_email,
            "assessment_id": assessment_id,
        },
    )


def log_api_error(path: str, method: str, status: int, error: str, user_email: str = ""):
    """Log API errors."""
    logger.warning(
        f"API error: {method} {path} -> {status} {error}",
        extra={"user_email": user_email},
    )
