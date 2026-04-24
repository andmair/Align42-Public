#!/usr/bin/env python3
import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DEFAULT_INDEX = "Align42.html"
SUPPORTED_API_HOSTS = (
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://generativelanguage.googleapis.com",
    "https://*.openai.azure.com",
)


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".svg": "image/svg+xml",
        ".html": "text/html; charset=utf-8",
    }

    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(directory or ROOT), **kwargs)

    def add_standard_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; "
            f"connect-src 'self' {' '.join(SUPPORTED_API_HOSTS)}; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:;",
        )

    def end_headers(self):
        self.add_standard_headers()
        super().end_headers()

    def list_directory(self, path):
        self.send_error(403, "Directory listing is disabled")
        return None

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Allow", "GET, HEAD, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            return self.send_json(410, {
                "error": "Align42 no longer exposes server-side persistence APIs. The application stores user data locally in the browser only."
            })
        return super().do_GET()

    def translate_path(self, path):
        parsed = urlparse(path)
        requested = parsed.path or "/"
        if requested in {"/", ""}:
            requested = f"/{DEFAULT_INDEX}"
        target = super().translate_path(requested)
        target_path = Path(target)
        try:
            target_path.relative_to(ROOT)
            return str(target_path)
        except ValueError:
            return str(ROOT / DEFAULT_INDEX)

    def send_json(self, status, payload):
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main():
    port = int(os.getenv("PORT", "8000"))
    handler = partial(Handler, directory=ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", port), handler)
    print(f"Align42 running at http://localhost:{port}/{DEFAULT_INDEX}")
    server.serve_forever()


if __name__ == "__main__":
    main()
