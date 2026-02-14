import io
import sqlite3
import tempfile
import unittest
from pathlib import Path

import server


class HeaderCaptureHandler:
    def __init__(self):
        self.status = None
        self.headers = {}
        self.wfile = io.BytesIO()

    def send_response(self, status):
        self.status = status

    def send_header(self, key, value):
        self.headers[key] = value

    def end_headers(self):
        return None

    def add_standard_headers(self):
        server.Handler.add_standard_headers(self)


class TestServerMigrations(unittest.TestCase):
    def test_init_db_on_fresh_database(self):
        with tempfile.TemporaryDirectory() as tmp:
            old_db_path = server.DB_PATH
            old_upload_dir = server.UPLOAD_DIR
            try:
                server.DB_PATH = Path(tmp) / "fresh.db"
                server.UPLOAD_DIR = Path(tmp) / "uploads"
                server.init_db()

                conn = sqlite3.connect(server.DB_PATH)
                cur = conn.cursor()
                cur.execute("PRAGMA table_info(assessment_collaborators)")
                cols = {row[1] for row in cur.fetchall()}
                self.assertIn("delegation_id", cols)
                self.assertIn("delegate_role", cols)

                cur.execute(
                    "SELECT 1 FROM sqlite_master WHERE type='index' AND name='idx_collaborators_delegation'"
                )
                self.assertIsNotNone(cur.fetchone())
                conn.close()
            finally:
                server.DB_PATH = old_db_path
                server.UPLOAD_DIR = old_upload_dir


class TestServerSecurityAndDelegationHelpers(unittest.TestCase):
    def test_auth_request_link_response_excludes_magic_link(self):
        payload = server.build_auth_request_link_response(True, "Draft created", "mailto:test@example.com")
        self.assertEqual(payload["ok"], True)
        self.assertIn("draftUrl", payload)
        self.assertNotIn("magicLink", payload)

    def test_csp_includes_supported_provider_domains(self):
        capture = HeaderCaptureHandler()
        server.Handler.add_standard_headers(capture)
        csp = capture.headers.get("Content-Security-Policy", "")
        self.assertIn("https://api.openai.com", csp)
        self.assertIn("https://api.anthropic.com", csp)
        self.assertIn("https://generativelanguage.googleapis.com", csp)
        self.assertIn("https://*.openai.azure.com", csp)

    def test_send_binary_applies_standard_security_headers(self):
        capture = HeaderCaptureHandler()
        server.Handler.send_binary(
            capture,
            200,
            b"abc",
            "text/plain",
            content_disposition="attachment; filename=\"evidence.txt\"",
        )
        self.assertEqual(capture.status, 200)
        self.assertEqual(capture.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(capture.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(capture.headers.get("Referrer-Policy"), "no-referrer")
        self.assertEqual(capture.headers.get("Content-Disposition"), "attachment; filename=\"evidence.txt\"")
        self.assertEqual(capture.wfile.getvalue(), b"abc")

    def test_delegate_role_normalization(self):
        self.assertEqual(server.normalize_delegate_role("CISO"), "CISO")
        self.assertEqual(server.normalize_delegate_role("cRo"), "CRO")
        self.assertEqual(server.normalize_delegate_role("unknown"), "CONTRIBUTOR")

    def test_delegation_grouping_preserves_role_and_status_transition(self):
        rows = [
            {
                "delegation_id": "d1",
                "user_email": "delegate@example.com",
                "delegate_name": "Casey",
                "delegate_title": "Chief Information Security Officer",
                "delegate_role": "CISO",
                "delegated_at": "2026-02-14T10:00:00Z",
                "status": "SENT",
                "control_id": "c8_security",
            },
            {
                "delegation_id": "d1",
                "user_email": "delegate@example.com",
                "delegate_name": "Casey",
                "delegate_title": "Chief Information Security Officer",
                "delegate_role": "CISO",
                "delegated_at": "2026-02-14T10:00:00Z",
                "status": "RESPONDED",
                "control_id": "c8_incident",
            },
        ]
        grouped = server.group_delegation_rows(rows)
        self.assertIn("d1", grouped)
        item = grouped["d1"]
        self.assertEqual(item["role"], "CISO")
        self.assertEqual(item["status"], "RESPONDED")
        self.assertEqual(set(item["controlIds"]), {"c8_security", "c8_incident"})


if __name__ == "__main__":
    unittest.main()
