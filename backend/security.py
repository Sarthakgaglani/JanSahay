"""Password, token, and authorization helpers for JanSahay's citizen APIs."""

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.database import get_user_by_id

PASSWORD_ALGORITHM = "scrypt"
ACCESS_TOKEN_MINUTES = max(5, int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
REFRESH_TOKEN_DAYS = max(1, int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7")))
APP_ENV = os.getenv("APP_ENV", "development").lower()


def _secret_key() -> bytes:
    configured = os.getenv("SECRET_KEY")
    if configured:
        return configured.encode("utf-8")
    if APP_ENV in {"production", "prod"}:
        raise RuntimeError("SECRET_KEY must be configured in production.")
    # Development only: generated at process start, never written to disk or logs.
    return secrets.token_bytes(32)


SECRET_KEY = _secret_key()
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return "$".join((PASSWORD_ALGORITHM, base64.urlsafe_b64encode(salt).decode(), base64.urlsafe_b64encode(derived).decode()))


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, encoded_salt, encoded_hash = stored_hash.split("$", 2)
        if algorithm != PASSWORD_ALGORITHM:
            return False
        salt = base64.urlsafe_b64decode(encoded_salt.encode())
        expected = base64.urlsafe_b64decode(encoded_hash.encode())
        actual = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _encode_segment(value: Dict[str, Any]) -> str:
    raw = json.dumps(value, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _decode_segment(value: str) -> Dict[str, Any]:
    padded = value + "=" * (-len(value) % 4)
    return json.loads(base64.urlsafe_b64decode(padded.encode("ascii")))


def create_access_token(user: Dict[str, Any]) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user["id"]),
        "role": user.get("role", "citizen"),
        "type": "access",
        "iat": now,
        "exp": now + ACCESS_TOKEN_MINUTES * 60,
        "jti": str(uuid.uuid4()),
    }
    header = {"alg": "HS256", "typ": "JWT"}
    signing_input = f"{_encode_segment(header)}.{_encode_segment(payload)}"
    signature = hmac.new(SECRET_KEY, signing_input.encode("ascii"), hashlib.sha256).digest()
    return f"{signing_input}.{base64.urlsafe_b64encode(signature).rstrip(b'=').decode('ascii')}"


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        header, payload, supplied_signature = token.split(".")
        expected = hmac.new(SECRET_KEY, f"{header}.{payload}".encode("ascii"), hashlib.sha256).digest()
        supplied = base64.urlsafe_b64decode((supplied_signature + "=" * (-len(supplied_signature) % 4)).encode("ascii"))
        claims = _decode_segment(payload)
        if not hmac.compare_digest(expected, supplied) or claims.get("type") != "access":
            raise ValueError("Invalid token")
        if not claims.get("sub") or int(claims.get("exp", 0)) <= int(time.time()):
            raise ValueError("Expired token")
        return claims
    except (ValueError, TypeError, json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=401, detail={"code": "invalid_token", "message": "Authentication is required."})


def new_refresh_token() -> str:
    return f"{uuid.uuid4()}.{secrets.token_urlsafe(32)}"


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def refresh_expiry() -> str:
    return (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)).isoformat()


def public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user.get("role", "citizen"),
        "created_at": user.get("created_at"),
    }


async def require_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail={"code": "authentication_required", "message": "Authentication is required."})
    claims = decode_access_token(credentials.credentials)
    user = get_user_by_id(claims["sub"])
    if not user:
        raise HTTPException(status_code=401, detail={"code": "invalid_token", "message": "Authentication is required."})
    return user


def require_role(roles: Iterable[str]):
    allowed_roles = set(roles)

    async def dependency(user: Dict[str, Any] = Depends(require_authenticated_user)) -> Dict[str, Any]:
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail={"code": "forbidden", "message": "You do not have permission for this action."})
        return user

    return dependency
