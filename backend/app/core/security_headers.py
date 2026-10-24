from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """OWASP-compliant HTTP Security Headers Middleware.
    
    Protects against Clickjacking, MIME sniffing, Cross-Site Scripting (XSS),
    and enforces strict transport security in production environments.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # 1. Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # 2. Prevent MIME-type Sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # 3. Legacy XSS Protection for older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # 4. Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 5. Restrict Browser Features & Permissions
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )

        # 6. Content Security Policy (CSP)
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' http: https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response.headers["Content-Security-Policy"] = csp_policy

        # 7. Strict-Transport-Security (HSTS) - Enforce on HTTPS or in production
        if settings.ENVIRONMENT == "production" or request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        return response
