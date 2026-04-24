import io
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
        self.add_standard_headers()
        return None

    def add_standard_headers(self):
        server.Handler.add_standard_headers(self)

    def send_json(self, status, payload):
        server.Handler.send_json(self, status, payload)


class TestServerStaticDelivery(unittest.TestCase):
    def test_csp_includes_supported_provider_domains(self):
        capture = HeaderCaptureHandler()
        server.Handler.add_standard_headers(capture)
        csp = capture.headers.get("Content-Security-Policy", "")
        self.assertIn("https://api.openai.com", csp)
        self.assertIn("https://api.anthropic.com", csp)
        self.assertIn("https://generativelanguage.googleapis.com", csp)
        self.assertIn("https://*.openai.azure.com", csp)

    def test_send_json_applies_security_headers(self):
        capture = HeaderCaptureHandler()
        server.Handler.send_json(capture, 410, {"error": "deprecated"})
        self.assertEqual(capture.status, 410)
        self.assertEqual(capture.headers.get("Content-Type"), "application/json; charset=utf-8")
        self.assertEqual(capture.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(capture.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(capture.headers.get("Referrer-Policy"), "no-referrer")
        self.assertIn(b"deprecated", capture.wfile.getvalue())

    def test_translate_path_defaults_to_align42_html(self):
        with tempfile.TemporaryDirectory() as tmp:
            old_root = server.ROOT
            try:
                server.ROOT = Path(tmp)
                (server.ROOT / "Align42.html").write_text("ok", encoding="utf-8")
                handler = object.__new__(server.Handler)
                handler.directory = str(server.ROOT)
                translated = server.Handler.translate_path(handler, "/")
                self.assertEqual(Path(translated), server.ROOT / "Align42.html")
            finally:
                server.ROOT = old_root

    def test_api_requests_return_deprecation_payload(self):
        capture = HeaderCaptureHandler()
        capture.path = "/api/session"
        server.Handler.do_GET(capture)
        body = capture.wfile.getvalue().decode("utf-8")
        self.assertEqual(capture.status, 410)
        self.assertIn("no longer exposes server-side persistence APIs", body)


if __name__ == "__main__":
    unittest.main()
