import time
from collections import defaultdict
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette import status
from app.core.config import settings


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter per IP address."""

    def __init__(self, default_limit: int = 120, default_window: int = 60):
        self.default_limit = default_limit
        self.default_window = default_window
        # Map IP -> list of timestamp floats
        self._records: Dict[str, List[float]] = defaultdict(list)
        # Specific limits for sensitive paths: (path_prefix, limit, window_seconds)
        self.sensitive_rules: List[Tuple[str, int, int]] = [
            ("/api/v1/auth/login", 15, 60),
            ("/api/v1/auth/register", 10, 60),
            ("/api/v1/auth/reset-password", 5, 60),
            ("/api/v1/enquiries", 15, 60),
            ("/api/v1/ai/", 30, 60),
        ]

    def _get_rule_for_path(self, path: str) -> Tuple[int, int]:
        for prefix, limit, window in self.sensitive_rules:
            if path.startswith(prefix):
                return limit, window
        return self.default_limit, self.default_window

    def is_allowed(self, client_ip: str, path: str) -> Tuple[bool, int, int, int]:
        """Checks if request from client_ip is allowed.
        Returns: (is_allowed, limit, remaining, retry_after)
        """
        now = time.time()
        limit, window = self._get_rule_for_path(path)
        key = f"{client_ip}:{path}" if any(path.startswith(p) for p, _, _ in self.sensitive_rules) else client_ip

        timestamps = self._records[key]
        # Purge timestamps outside window
        cutoff = now - window
        timestamps = [t for t in timestamps if t > cutoff]
        self._records[key] = timestamps

        if len(timestamps) >= limit:
            oldest = timestamps[0]
            retry_after = max(1, int(window - (now - oldest)))
            return False, limit, 0, retry_after

        # Record this request
        timestamps.append(now)
        self._records[key] = timestamps
        remaining = max(0, limit - len(timestamps))
        return True, limit, remaining, 0

    def reset(self):
        """Reset all rate limiter records (useful for test isolation)."""
        self._records.clear()


rate_limiter = InMemoryRateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware applying rate limits per IP address to safeguard against DoS and credential stuffing."""

    async def dispatch(self, request: Request, call_next):
        # Bypass rate limiting if disabled in config (e.g., during unit tests)
        rate_limit_enabled = getattr(settings, "RATE_LIMIT_ENABLED", True)
        if not rate_limit_enabled:
            return await call_next(request)

        path = request.url.path

        # Whitelist non-mutating observability endpoints
        if path in ("/api/v1/health", "/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        # Resolve client IP (supporting X-Forwarded-For if behind a proxy)
        client_ip = request.headers.get("x-forwarded-for")
        if client_ip:
            client_ip = client_ip.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"

        allowed, limit, remaining, retry_after = rate_limiter.is_allowed(client_ip, path)

        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Rate limit exceeded. Maximum {limit} requests permitted per window. Please try again in {retry_after} seconds."
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
