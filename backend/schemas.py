from typing import List

from pydantic import BaseModel, Field, validator


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)

    @validator("email")
    def validate_email(cls, value):
        email = value.strip().lower()
        if email.count("@") != 1 or "." not in email.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address.")
        return email


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=1, max_length=128)

    @validator("email")
    def normalize_email(cls, value):
        return value.strip().lower()


class DocumentCheck(BaseModel):
    label: str = Field(..., min_length=1, max_length=300)
    checked: bool


class ApplicationCreateRequest(BaseModel):
    scheme_slug: str = Field(..., min_length=1, max_length=160)
    demo_name: str = Field(..., min_length=2, max_length=60)
    state: str = Field(..., min_length=2, max_length=80)
    district: str = Field(..., min_length=2, max_length=80)
    preferred_contact_method: str = Field(..., min_length=2, max_length=80)
    document_checks: List[DocumentCheck] = Field(default_factory=list, max_items=30)
    eligibility_confirmed: bool

    @validator("demo_name", "state", "district", "preferred_contact_method")
    def strip_text(cls, value):
        return value.strip()
