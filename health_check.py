#!/usr/bin/env python3
"""Health check and monitoring endpoints for Align42."""
import json
import os
import time
from datetime import datetime
from pathlib import Path


class HealthChecker:
    """Monitor application health."""

    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0

    def get_health_status(self) -> dict:
        """Get current health status."""
        uptime_seconds = int(time.time() - self.start_time)
        uptime_hours = uptime_seconds // 3600
        uptime_minutes = (uptime_seconds % 3600) // 60

        # Check if required files exist
        required_files = [
            self.root_dir / "Align42.html",
            self.root_dir / "app.js",
            self.root_dir / "styles.css",
        ]
        missing_files = [str(f.name) for f in required_files if not f.exists()]

        status = "healthy" if not missing_files else "degraded"

        return {
            "status": status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "uptime": f"{uptime_hours}h {uptime_minutes}m",
            "uptime_seconds": uptime_seconds,
            "requests_processed": self.request_count,
            "errors": self.error_count,
            "error_rate": (
                (self.error_count / self.request_count * 100)
                if self.request_count > 0
                else 0
            ),
            "version": os.getenv("APP_VERSION", "dev"),
            "environment": os.getenv("ENVIRONMENT", "development"),
            "missing_files": missing_files,
        }

    def get_metrics(self) -> dict:
        """Get application metrics."""
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "requests": self.request_count,
            "errors": self.error_count,
            "error_rate_percent": (
                (self.error_count / self.request_count * 100)
                if self.request_count > 0
                else 0
            ),
            "uptime_seconds": int(time.time() - self.start_time),
        }

    def record_request(self):
        """Record a request."""
        self.request_count += 1

    def record_error(self):
        """Record an error."""
        self.error_count += 1
