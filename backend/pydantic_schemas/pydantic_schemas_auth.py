from pydantic import BaseModel, field_validator, ValidationInfo, Field, model_validator
from datetime import datetime
from typing import Any, List
from uuid import UUID
from dotenv import load_dotenv
from typing_extensions import Self
from os import getenv
import re
from fastapi import HTTPException
from authorization.authorization_utils import validate_password
from exceptions.custom_exceptions import ValidationErrorExc

load_dotenv()

DATE_FORMAT = getenv("DATETIME_BASE_FORMAT")
USERNAME_MIN_L = int(getenv("USERNAME_MIN_L", "3"))
USERNAME_MAX_L = int(getenv("USERNAME_MAX_L", "32"))

PASSWORD_MIN_L = int(getenv("PASSWORD_MIN_L", "8"))
PASSWORD_MAX_L = int(getenv("PASSWORD_MAX_L", "32"))


# PRIVATE - App only usage
# ==========================
class PayloadJWT(BaseModel):
    user_id: str
    issued_at: datetime

    @field_validator("issued_at", mode="before")
    @classmethod
    def from_unix_to_datetime(cls, value: any) -> datetime:
        if isinstance(value, int):
            value = datetime.fromtimestamp(value)
        elif isinstance(value, str):
            value = datetime.strptime(value, DATE_FORMAT)
        elif isinstance(value, datetime):
            pass
        else:
            raise TypeError("Invalid issued_at type. Should be: int | str | datetime")
        return value


# Body forms
# ==============
class LoginSchema(BaseModel):
    username: str = Field(..., min_length=USERNAME_MIN_L, max_length=USERNAME_MAX_L)
    password: str = Field(..., min_length=PASSWORD_MIN_L, max_length=PASSWORD_MAX_L)

class RegisterSchema(LoginSchema):
    email: str
    
class OldNewPassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=PASSWORD_MIN_L, max_length=PASSWORD_MAX_L)


    @model_validator(mode="after")
    def match_passwords(self) -> Self:
        if self.old_password == self.new_password:
            raise ValidationErrorExc(detail="OldNewPassword Pydantic schema: Old password metched new one.", client_safe_detail="Old password can not match the new one!")
        return self

class NewUsername(BaseModel):
    new_username: str = Field(..., min_length=USERNAME_MIN_L, max_length=USERNAME_MAX_L)

# =============


# JWT Token models
# ================

class RefreshAccesTokensProvided(BaseModel):
    refresh_token: str
    access_token: str

class RefreshTokenSchema(BaseModel):
    refresh_token: str
    expires_at_refresh: str

    @field_validator("expires_at_refresh", mode="before")
    @classmethod
    def normalize_datetime(cls, value: Any) -> str:
        if isinstance(value, int):
            value = datetime.fromtimestamp(value).strftime(DATE_FORMAT)
        elif isinstance(value, datetime):
            value = value.strftime(DATE_FORMAT)
        return value

class AccessTokenSchema(BaseModel):
    access_token: str
    expires_at_access: str

    @field_validator("expires_at_access", mode="before")
    @classmethod
    def normalize_datetime(cls, value: Any) -> str:
        if isinstance(value, int):
            value = datetime.fromtimestamp(value).strftime(DATE_FORMAT)
        elif isinstance(value, datetime):
            value = value.strftime(DATE_FORMAT)
        return value


class RefreshAccessTokens(RefreshTokenSchema, AccessTokenSchema):
    pass
