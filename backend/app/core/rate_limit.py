import time
from collections import defaultdict
from typing import Dict, List, Optional
try:
    from fastapi import Request, HTTPException, status
except ImportError:
    from typing import Any
    Request = Any
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str, headers: dict = None):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail
            self.headers = headers
    class status:
        HTTP_429_TOO_MANY_REQUESTS = 429

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
    SLOWAPI_AVAILABLE = True
except ImportError:
    limiter = None
    RateLimitExceeded = Exception
    SLOWAPI_AVAILABLE = False


def get_client_ip(request: Request) -> str:
    """Extract real client IP address considering proxy headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter with automatic expiration."""

    def __init__(self):
        # Maps key (ip + prefix) -> list of timestamp floats
        self._history: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, int]:
        now = time.time()
        window_start = now - window_seconds

        # Prune old timestamps
        timestamps = [t for t in self._history[key] if t > window_start]
        self._history[key] = timestamps

        if len(timestamps) >= max_requests:
            retry_after = int(window_seconds - (now - timestamps[0])) + 1
            return True, max(1, retry_after)

        self._history[key].append(now)
        return False, 0


# Global memory limiter instance
_memory_limiter = InMemoryRateLimiter()


class RateLimiter:
    """FastAPI Dependency for rate limiting endpoints."""

    def __init__(self, times: int, seconds: int, scope: Optional[str] = None):
        self.times = times
        self.seconds = seconds
        self.scope = scope

    async def __call__(self, request: Request):
        ip = get_client_ip(request)
        path = self.scope or request.url.path
        key = f"{ip}:{path}"

        limited, retry_after = _memory_limiter.is_rate_limited(
            key=key,
            max_requests=self.times,
            window_seconds=self.seconds,
        )

        if limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Límite de peticiones excedido ({self.times} por minuto). Por favor espera {retry_after}s antes de reintentar.",
                headers={"Retry-After": str(retry_after)},
            )
        return True


# Pre-configured rate limiters for critical application endpoints
auth_rate_limiter = RateLimiter(times=5, seconds=60, scope="auth")
recovery_rate_limiter = RateLimiter(times=3, seconds=60, scope="recovery")
mutation_rate_limiter = RateLimiter(times=60, seconds=60, scope="mutation")
