#!/usr/bin/env python3
"""Align42 - ISO 42001 AI Governance Assessment Tool."""
import json
import logging
import os
import time
from collections import defaultdict
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from health_check import HealthChecker

ROOT = Path(__file__).resolve().parent
DEFAULT_INDEX = "Align42.html"
LOG_DIR = ROOT / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Security configuration
SUPPORTED_API_HOSTS = (
    "https://api.openai.com",
    "https://api.anthropic.com",
    "https://generativelanguage.googleapis.com",
    "https://*.openai.azure.com",
)

# Rate limiting
class RateLimiter:
    """Simple in-memory rate limiter by IP."""
    def __init__(self, max_requests=10, window_seconds=3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed."""
        now = time.time()
        self.requests[key] = [
            t for t in self.requests[key]
            if now - t < self.window_seconds
        ]
        if len(self.requests[key]) >= self.max_requests:
            return False
        self.requests[key].append(now)
        return True


# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "align42.log"),
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger("align42")

# Health checker instance
health_checker = HealthChecker(ROOT)


class Handler(SimpleHTTPRequestHandler):
    """HTTP request handler with security enhancements."""
    
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".svg": "image/svg+xml",
        ".html": "text/html; charset=utf-8",
    }
    
    # Rate limiters
    general_limiter = RateLimiter(max_requests=100, window_seconds=60)
    
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(directory or ROOT), **kwargs)

    def get_client_ip(self) -> str:
        """Get client IP, handling X-Forwarded-For header."""
        forwarded = self.headers.get("X-Forwarded-For", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return self.client_address[0]

    def add_security_headers(self):
        """Add comprehensive security headers."""
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        
        # Strict CSP without unsafe-inline
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self'; "
            f"connect-src 'self' {' '.join(SUPPORTED_API_HOSTS)}; "
            "img-src 'self' data:; "
            "style-src 'self' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        
        # HSTS (only if HTTPS)
        if os.getenv("COOKIE_SECURE", "false").lower() == "true":
            self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

    def end_headers(self):
        """Add security headers before sending response."""
        self.add_security_headers()
        super().end_headers()

    def log_request(self, code="", size=""):
        """Log HTTP requests."""
        logger.info(
            f"{self.command} {self.path} -> {code}",
            extra={"client_ip": self.get_client_ip()},
        )

    def list_directory(self, path):
        """Disable directory listing."""
        self.send_error(403, "Directory listing is disabled")
        return None

    def do_OPTIONS(self):
        """Handle OPTIONS requests."""
        self.send_response(200)
        self.send_header("Allow", "GET, HEAD, OPTIONS")
        self.end_headers()

    def do_GET(self):
        """Handle GET requests with rate limiting."""
        client_ip = self.get_client_ip()
        health_checker.record_request()
        
        # Rate limit general requests
        if not self.general_limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit exceeded for {client_ip}")
            health_checker.record_error()
            self.send_error(429, "Too Many Requests")
            return

        parsed = urlparse(self.path)
        
        # Health check endpoint
        if parsed.path == "/health":
            return self.send_json(200, health_checker.get_health_status())
        
        # Metrics endpoint
        if parsed.path == "/metrics":
            return self.send_json(200, health_checker.get_metrics())

        # Reject /api/ requests
        if parsed.path.startswith("/api/"):
            health_checker.record_error()
            return self.send_json(410, {
                "error": "Align42 no longer exposes server-side persistence APIs. "
                         "The application stores user data locally in the browser only."
            })
        
        return super().do_GET()

    def translate_path(self, path):
        """Translate URL path to filesystem path with security."""
        parsed = urlparse(path)
        requested = parsed.path or "/"
        
        # Route root to default index
        if requested in {"/", ""}:
            requested = f"/{DEFAULT_INDEX}"
        
        # Get the translated path
        target = super().translate_path(requested)
        target_path = Path(target)
        
        # Prevent path traversal attacks
        try:
            target_path.relative_to(ROOT)
            return str(target_path)
        except ValueError:
            # Path is outside root - return default index
            logger.warning(f"Path traversal attempt: {requested}")
            return str(ROOT / DEFAULT_INDEX)

    def send_json(self, status, payload):
        """Send JSON response."""
        raw = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main():
    """Start HTTP server."""
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    handler = partial(Handler, directory=ROOT)
    server = ThreadingHTTPServer((host, port), handler)
    
    logger.info(f"Align42 running at http://localhost:{port}/{DEFAULT_INDEX}")
    logger.info(f"Health check available at http://localhost:{port}/health")
    logger.info(f"Metrics available at http://localhost:{port}/metrics")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server shutdown")
        server.shutdown()


if __name__ == "__main__":
    main()
