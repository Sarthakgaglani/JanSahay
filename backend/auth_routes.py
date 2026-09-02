import os

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response

from backend.database import create_refresh_session, create_user, get_active_refresh_session, get_user_by_email, get_user_by_id, revoke_refresh_session
from backend.rate_limit import enforce_rate_limit
from backend.schemas import LoginRequest, SignupRequest
from backend.security import (
    REFRESH_TOKEN_DAYS,
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    public_user,
    refresh_expiry,
    require_authenticated_user,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
REFRESH_COOKIE = "jansahay_refresh"
COOKIE_SECURE = str(os.getenv("COOKIE_SECURE", os.getenv("APP_ENV", "development").lower() in {"production", "prod"})).lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "none" if COOKIE_SECURE else "lax")


def _error(status_code: int, code: str, message: str):
    raise HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _clear_refresh_cookie(response: Response):
    response.delete_cookie(
        REFRESH_COOKIE,
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        httponly=True,
    )


def _set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60,
        path="/",
    )


def _session_response(response: Response, user: dict):
    refresh_token = new_refresh_token()
    create_refresh_session(user["id"], hash_refresh_token(refresh_token), refresh_expiry())
    _set_refresh_cookie(response, refresh_token)
    return {
        "success": True,
        "message": "Authenticated.",
        "data": {"access_token": create_access_token(user), "token_type": "bearer", "user": public_user(user)},
    }


@router.post("/signup", status_code=201)
async def signup(request: Request, payload: SignupRequest, response: Response):
    await enforce_rate_limit(request, "signup", limit=5)
    user = create_user(payload.full_name.strip(), payload.email, hash_password(payload.password))
    if not user:
        _error(409, "email_in_use", "An account with this email already exists.")
    return _session_response(response, user)


@router.post("/login")
async def login(request: Request, payload: LoginRequest, response: Response):
    await enforce_rate_limit(request, "login", limit=8)
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        _error(401, "invalid_credentials", "Email or password is incorrect.")
    return _session_response(response, user)


@router.post("/refresh")
async def refresh(request: Request, response: Response, refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    await enforce_rate_limit(request, "refresh", limit=20)
    if not refresh_token:
        _error(401, "authentication_required", "Your session has expired. Please sign in again.")
    session = get_active_refresh_session(hash_refresh_token(refresh_token))
    if not session:
        _clear_refresh_cookie(response)
        _error(401, "invalid_session", "Your session has expired. Please sign in again.")
    user = get_user_by_id(session["user_id"])
    if not user:
        revoke_refresh_session(hash_refresh_token(refresh_token))
        _clear_refresh_cookie(response)
        _error(401, "invalid_session", "Your session has expired. Please sign in again.")
    revoke_refresh_session(hash_refresh_token(refresh_token))
    return _session_response(response, user)


@router.post("/logout")
async def logout(response: Response, refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    if refresh_token:
        revoke_refresh_session(hash_refresh_token(refresh_token))
    _clear_refresh_cookie(response)
    return {"success": True, "message": "Signed out.", "data": {}}


@router.get("/me")
async def current_user(user: dict = Depends(require_authenticated_user)):
    return {"success": True, "message": "Success", "data": {"user": public_user(user)}}
