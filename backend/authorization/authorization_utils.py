from services.postgres_service import get_session, User

from fastapi import Header
from fastapi.websockets import WebSocket

from dotenv import load_dotenv
from os import getenv
import re

from exceptions.custom_exceptions import *
from exceptions.exceptions_handler import (
    endpoint_exception_handler,
    ws_endpoint_exception_handler,
)
from services_types import EndpointAuthType

load_dotenv()

PASSWORD_MIN_L = int(getenv("PASSWORD_MIN_L"))
PASSWORD_MAX_L = int(getenv("PASSWORD_MAX_L"))


async def _authorize_token(
    token: str, token_type: EndpointAuthType, return_user: bool
) -> User | None:
    # To prevent circular import
    from services.core_services import MainServiceContextManager
    from services.core_services.main_services import MainServiceAuth

    session = await get_session()
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.authorize_token_and_optionally_return_user(
            token=token, token_type=token_type, return_user=return_user
        )


@endpoint_exception_handler
async def authorize_private_endpoint(
    token: str = Header(
        ..., title="Authorization access/refresh token", examples="Bearer {token}"
    ),
) -> User:
    """Use with fastAPI Depends() in private endpoint"""
    return await _authorize_token(token=token, token_type="access", return_user=True)


@endpoint_exception_handler
async def authorize_public_endpoint(
    token: str = Header(
        ..., title="Optional authorization access token", examples="Bearer {token}"
    ),
) -> User:
    print(token)
    """Use with fastAPI Depends() in public endpoints"""
    return await _authorize_token(
        token=token, token_type="optional-access", return_user=True
    )


@endpoint_exception_handler
async def authorize_password_recovery_endpoint(
    token: str = Header(
        ..., title="Authorization password recovery token", examples="Bearer {token}"
    ),
) -> User:
    """Use with fastAPI Depends() in password recovery enpoint"""
    print(token)
    return await _authorize_token(
        token=token, token_type="password-recovery", return_user=True
    )


@ws_endpoint_exception_handler
async def authorize_chat_token(websocket: WebSocket, token: str) -> None:
    """User with fastAPI Depends()"""

    # To prevent circular import
    from services.core_services import MainServiceContextManager
    from services.core_services.main_services import MainServiceAuth

    session = await get_session()
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.authorize_chat_token(token=token)


def validate_password(password: str) -> None:
    """Raises ValidationErrorExc if password not secure enough"""

    if not re.match(r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])", password):
        raise ValidationErrorExc(
            detail="validate_password: Password validation failed",
            client_safe_detail="Password is not secure enough.",
        )


def validate_email(email: str) -> None:
    print(email)
    if not re.match(
        r"^(?!\.)(?!.*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
        r"@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$",
        email,
    ):
        raise ValidationErrorExc(
            detail="validate_email: Email validation failed",
            client_safe_detail="Invalid Email!",
        )
