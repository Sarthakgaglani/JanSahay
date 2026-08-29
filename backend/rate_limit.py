"""Small, bounded in-memory limiter for expensive endpoints.

Redis is intentionally optional in this hackathon deployment. This limiter protects a
single process and keeps state bounded; deployments needing cross-instance limits can
replace this module with a Redis-backed implementation without changing routes.
"""

import os
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
WINDOW_SECONDS = max(10, int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60")))
DEFAULT_LIMIT = max(1, int(os.getenv("RATE_LIMIT_REQUESTS", "60")))
_requests = defaultdict(deque)


async def enforce_rate_limit(request: Request, scope: str, limit: int = DEFAULT_LIMIT):
    if not RATE_LIMIT_ENABLED:
        return
    client = request.client.host if request.client else "unknown"
    key = f"{scope}:{client}"
    now = time.monotonic()
    bucket = _requests[key]
    while bucket and bucket[0] <= now - WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(
            status_code=429,
            detail={"code": "rate_limited", "message": "Too many requests. Please try again shortly."},
            headers={"Retry-After": str(WINDOW_SECONDS)},
        )
    bucket.append(now)
