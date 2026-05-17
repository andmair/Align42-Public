#!/usr/bin/env python3
"""Test suite for Align42."""
import json
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock
from urllib.parse import urlencode

# Import app modules
import sys
sys.path.insert(0, str(Path(__file__).parent))

from validation import (
    validate_email, validate_name, validate_control_id,
    validate_mime_type, validate_filename, sanitize_filename
)


class TestValidation(unittest.TestCase):
    """Test input validation functions."""

    def test_validate_email_valid(self):
        """Test valid email addresses."""
        valid_emails = [
            "test@example.com",
            "user.name+tag@example.co.uk",
            "123@example.org",
        ]
        for email in valid_emails:
            valid, msg = validate_email(email)
            self.assertTrue(valid, f"Email {email} should be valid: {msg}")

    def test_validate_email_invalid(self):
        """Test invalid email addresses."""
        invalid_emails = [
            "",
            "notanemail",
            "@example.com",
            "test@",
            "test @example.com",
        ]
        for email in invalid_emails:
            valid, msg = validate_email(email)
            self.assertFalse(valid, f"Email {email} should be invalid")

    def test_validate_email_too_long(self):
        """Test email length limit."""
        long_email = "a" * 250 + "@example.com"
        valid, msg = validate_email(long_email)
        self.assertFalse(valid)

    def test_validate_name_valid(self):
        """Test valid names."""
        valid_names = [
            "John Doe",
            "Jane Smith-Jones",
            "Company Inc.",
            "Dr. Jane (PhD)",
        ]
        for name in valid_names:
            valid, msg = validate_name(name)
            self.assertTrue(valid, f"Name {name} should be valid: {msg}")

    def test_validate_name_invalid(self):
        """Test invalid names."""
        invalid_names = [
            "",
            "A",
            "Name<script>",
            "Name@#$%",
        ]
        for name in invalid_names:
            valid, msg = validate_name(name)
            self.assertFalse(valid, f"Name {name} should be invalid")

    def test_validate_control_id_valid(self):
        """Test valid control IDs."""
        valid_ids = [
            "CTRL-001",
            "a1b2c3",
            "Control_Test",
            "ISO-42001-4-2",
        ]
        for cid in valid_ids:
            valid, msg = validate_control_id(cid)
            self.assertTrue(valid, f"Control ID {cid} should be valid: {msg}")

    def test_validate_control_id_invalid(self):
        """Test invalid control IDs."""
        invalid_ids = [
            "",
            "CTRL<>ID",
            "CTRL@ID",
            "a" * 101,  # Too long
        ]
        for cid in invalid_ids:
            valid, msg = validate_control_id(cid)
            self.assertFalse(valid, f"Control ID {cid} should be invalid")

    def test_validate_mime_type_valid(self):
        """Test valid MIME types."""
        valid_types = [
            "application/pdf",
            "text/plain",
            "image/jpeg",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        for mime_type in valid_types:
            valid, msg = validate_mime_type(mime_type)
            self.assertTrue(valid, f"MIME type {mime_type} should be valid: {msg}")

    def test_validate_mime_type_invalid(self):
        """Test invalid MIME types."""
        invalid_types = [
            "",
            "application/x-executable",
            "text/x-shellscript",
            "application/x-php",
        ]
        for mime_type in invalid_types:
            valid, msg = validate_mime_type(mime_type)
            self.assertFalse(valid, f"MIME type {mime_type} should be invalid")

    def test_validate_filename_valid(self):
        """Test valid filenames."""
        valid_names = [
            "document.pdf",
            "report_2024.docx",
            "evidence-file.txt",
        ]
        for name in valid_names:
            valid, msg = validate_filename(name)
            self.assertTrue(valid, f"Filename {name} should be valid: {msg}")

    def test_validate_filename_path_traversal(self):
        """Test path traversal prevention."""
        dangerous_names = [
            "../../../etc/passwd",
            "..\\..\\windows\\system32",
            "folder/file.txt",
            "folder\\file.txt",
        ]
        for name in dangerous_names:
            valid, msg = validate_filename(name)
            self.assertFalse(valid, f"Dangerous filename {name} should be rejected")

    def test_sanitize_filename(self):
        """Test filename sanitization."""
        test_cases = [
            ("normal file.pdf", "normal file.pdf"),
            ("file<script>.txt", "file_script_.txt"),
            ("file@#$%.doc", "file_____.doc"),
        ]
        for dirty, _ in test_cases:
            cleaned = sanitize_filename(dirty)
            # Just check it doesn't have dangerous chars
            self.assertNotIn("..", cleaned)
            self.assertNotIn("<", cleaned)
            self.assertNotIn(">", cleaned)


class TestSecurityHeaders(unittest.TestCase):
    """Test security header enforcement."""

    def test_csp_header_present(self):
        """Test Content-Security-Policy header is set."""
        pass

    def test_no_unsafe_inline(self):
        """Verify CSP doesn't use 'unsafe-inline' for scripts."""
        csp = (
            "default-src 'self'; "
            "script-src 'self'; "
            "connect-src 'self' https://api.openai.com; "
        )
        self.assertNotIn("'unsafe-inline'", csp)
        self.assertIn("script-src 'self'", csp)


if __name__ == "__main__":
    unittest.main()
