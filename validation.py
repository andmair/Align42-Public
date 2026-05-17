"""Input validation utilities for Align42."""
import re
from typing import Tuple


ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
}

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
CONTROL_ID_REGEX = re.compile(r"^[A-Za-z0-9\-_.]{1,100}$")
NAME_REGEX = re.compile(r"^[A-Za-z0-9\s\-.,()]{1,255}$")


def validate_email(email: str) -> Tuple[bool, str]:
    """Validate email format."""
    if not email or len(email) > 254:
        return False, "Email must be between 1 and 254 characters"
    if not EMAIL_REGEX.match(email.strip().lower()):
        return False, "Invalid email format"
    return True, ""


def validate_name(name: str) -> Tuple[bool, str]:
    """Validate person/org name."""
    if not name or len(name) < 2:
        return False, "Name must be at least 2 characters"
    if len(name) > 255:
        return False, "Name must not exceed 255 characters"
    if not NAME_REGEX.match(name.strip()):
        return False, "Name contains invalid characters"
    return True, ""


def validate_control_id(control_id: str) -> Tuple[bool, str]:
    """Validate control identifier."""
    if not control_id:
        return False, "Control ID is required"
    if not CONTROL_ID_REGEX.match(control_id.strip()):
        return False, "Control ID contains invalid characters or exceeds 100 chars"
    return True, ""


def validate_mime_type(mime_type: str) -> Tuple[bool, str]:
    """Validate file MIME type."""
    if not mime_type:
        return False, "MIME type is required"
    base_type = mime_type.split(";")[0].strip().lower()
    if base_type not in ALLOWED_MIME_TYPES:
        return False, f"File type not allowed. Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
    return True, ""


def validate_filename(filename: str) -> Tuple[bool, str]:
    """Validate uploaded filename."""
    if not filename or len(filename) > 255:
        return False, "Filename must be 1-255 characters"
    # Prevent path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        return False, "Invalid filename"
    return True, ""


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for storage."""
    import re as regex
    # Remove path components
    filename = filename.split("/")[-1].split("\\")[-1]
    # Allow only alphanumeric, dots, dashes, underscores, spaces
    filename = regex.sub(r"[^A-Za-z0-9.\-_ ]", "_", filename)
    # Limit length
    return filename[:255] or "upload.bin"
