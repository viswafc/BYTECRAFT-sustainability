"""Uniform error responses. Stack traces are logged, never returned."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("aquarisk.errors")


class AppError(Exception):
    status_code = 500
    code = "INTERNAL_ERROR"

    def __init__(self, message: str, status_code: int | None = None, code: str | None = None):
        super().__init__(message)
        self.message = message
        if status_code:
            self.status_code = status_code
        if code:
            self.code = code


class ModelUnavailableError(AppError):
    status_code = 503
    code = "MODEL_NOT_READY"


class DatabaseUnavailableError(AppError):
    status_code = 503
    code = "DATABASE_UNAVAILABLE"


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"

    def __init__(self, entity: str, identifier, code: str | None = None):
        super().__init__(f"{entity} {identifier} was not found.", code=code or f"{entity.upper()}_NOT_FOUND")


class InvalidInputError(AppError):
    status_code = 422
    code = "INVALID_INPUT"


def _body(code: str, message: str, details=None) -> dict:
    out = {"error": {"code": code, "message": message}}
    if details is not None:
        out["error"]["details"] = details
    return out


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(request: Request, exc: AppError):
        log.warning("app error %s: %s", exc.code, exc.message, extra={"path": request.url.path})
        return JSONResponse(status_code=exc.status_code, content=_body(exc.code, exc.message))

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError):
        details = [
            {"loc": [str(x) for x in e.get("loc", [])], "msg": e.get("msg"), "type": e.get("type")}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422, content=_body("VALIDATION_ERROR", "Request validation failed", details)
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http(request: Request, exc: StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content=_body("HTTP_ERROR", str(exc.detail)))

    @app.exception_handler(OperationalError)
    async def _db_down(request: Request, exc: OperationalError):
        log.warning("database operational error", extra={"path": request.url.path})
        return JSONResponse(status_code=503, content=_body("DATABASE_UNAVAILABLE", "Database is unreachable."))

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception):
        log.exception("unhandled error", extra={"path": request.url.path})
        return JSONResponse(
            status_code=500,
            content=_body("INTERNAL_ERROR", "An unexpected error occurred. The incident has been logged."),
        )
