"""Rate limiting for Align42."""
import time
from collections import defaultdict
from functools import wraps


class RateLimiter:
    """Simple in-memory rate limiter."""

    def __init__(self):
        self.requests = defaultdict(list)
        self.max_attempts = 5
        self.window_seconds = 3600  # 1 hour

    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed. Returns False if rate limited."""
        now = time.time()
        # Remove old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if now - req_time < self.window_seconds
        ]
        
        if len(self.requests[key]) >= self.max_attempts:
            return False
        
        self.requests[key].append(now)
        return True

    def get_reset_time(self, key: str) -> int:
        """Get seconds until rate limit resets for key."""
        if not self.requests[key]:
            return 0
        oldest = min(self.requests[key])
        reset = int(oldest + self.window_seconds)
        return max(0, reset - int(time.time()))


# Global rate limiter instances
auth_limiter = RateLimiter()
api_limiter = RateLimiter()


def rate_limit_auth(func):
    """Decorator to rate-limit auth endpoints by IP/email."""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        # Get client IP from headers or fallback to remote addr
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        
        if not auth_limiter.is_allowed(client_ip):
            reset = auth_limiter.get_reset_time(client_ip)
            return self.send_json(
                429,
                {
                    "error": "Too many auth attempts. Please try again later.",
                    "retry_after": reset,
                },
            )
        return func(self, *args, **kwargs)
    return wrapper


def rate_limit_api(func):
    """Decorator to rate-limit API endpoints by user."""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        user = self.current_user()
        if user:
            if not api_limiter.is_allowed(user["email"]):
                reset = api_limiter.get_reset_time(user["email"])
                return self.send_json(
                    429,
                    {
                        "error": "Rate limit exceeded. Please try again later.",
                        "retry_after": reset,
                    },
                )
        return func(self, *args, **kwargs)
    return wrapper
