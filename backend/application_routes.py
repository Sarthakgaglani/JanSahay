from fastapi import APIRouter, Depends, HTTPException, Request

from backend.database import create_application, get_application_for_user, get_applications_for_user
from backend.rate_limit import enforce_rate_limit
from backend.schemas import ApplicationCreateRequest
from backend.schemes import get_scheme_by_slug
from backend.security import require_authenticated_user

router = APIRouter(prefix="/api/v1/applications", tags=["Applications"])


def _error(status_code: int, code: str, message: str):
    raise HTTPException(status_code=status_code, detail={"code": code, "message": message})


@router.get("")
async def list_applications(user: dict = Depends(require_authenticated_user)):
    return {"success": True, "message": "Success", "data": {"applications": get_applications_for_user(user["id"])}}


@router.post("", status_code=201)
async def submit_application(request: Request, payload: ApplicationCreateRequest, user: dict = Depends(require_authenticated_user)):
    await enforce_rate_limit(request, "applications", limit=30)
    if not payload.eligibility_confirmed:
        _error(422, "eligibility_confirmation_required", "Confirm the eligibility planning notice before submitting.")
    if any(not document.checked for document in payload.document_checks):
        _error(422, "document_readiness_incomplete", "Review every document requirement before submitting.")
    scheme = get_scheme_by_slug(payload.scheme_slug)
    if not scheme:
        _error(404, "scheme_not_found", "The selected scheme no longer exists.")
    application = create_application(user["id"], scheme, payload.dict())
    return {"success": True, "message": "Synthetic application created.", "data": {"application": application}}


@router.get("/{application_id}")
async def get_application(application_id: str, user: dict = Depends(require_authenticated_user)):
    application = get_application_for_user(user["id"], application_id)
    if not application:
        _error(404, "application_not_found", "Application not found.")
    return {"success": True, "message": "Success", "data": {"application": application}}
