"""Request-id + timing middleware producing one structured log line per request."""
from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

log = logging.getLogger("aquarisk.request")


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
        start = time.perf_counter()
        response = await call_next(request)
        duration = (time.perf_counter() - start) * 1000
        response.headers["x-request-id"] = rid
        log.info(
            "request",
            extra={
                "request_id": rid, "path": request.url.path, "method": request.method,
                "status_code": response.status_code, "duration_ms": round(duration, 2),
            },
        )
        return response
