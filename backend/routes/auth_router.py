from fastapi import APIRouter, Depends, Body, Header, Request
from services.postgres_service import *
from services.core_services import MainServiceContextManager, MainServiceAuth
from sqlalchemy.ext.asyncio import AsyncSession
from authorization.authorization_utils import (
    authorize_private_endpoint,
    authorize_password_recovery_endpoint,
)

from pydantic_schemas.pydantic_schemas_auth import *

# Somehow, * import doesn't work if object name begins with underscore
from pydantic_schemas.pydantic_schemas_auth import _2FAConfirmationBody
from exceptions.exceptions_handler import endpoint_exception_handler

from rate_limiter import limiter

auth = APIRouter()


@auth.post("/login")
@limiter.limit("5/minute")
@endpoint_exception_handler
async def login(
    request: Request,
    credentials: LoginBody = Body(...),
    session: AsyncSession = Depends(get_session_depends),
) -> RefreshAccessTokens:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session, include_email=True
    ) as auth:
        return await auth.login(credentials=credentials)


@auth.post("/register")
@limiter.limit("3/minute")
@endpoint_exception_handler
async def register(
    request: Request,
    credentials: RegisterBody = Body(...),
    session: AsyncSession = Depends(get_session_depends),
) -> EmailProvided:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session, include_email=True
    ) as auth:
        return await auth.register(credentials=credentials)


@auth.post("/auth/2fa/confirm-email")
@limiter.limit("10/minute")
@endpoint_exception_handler
async def confirm_2fa_email(
    request: Request,
    confirmation_credentials: _2FAConfirmationBody,
    session: AsyncSession = Depends(get_session_depends),
) -> RefreshAccessTokens:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.confirm_email_2fa(credentials=confirmation_credentials)


@auth.post("/auth/2fa/password-recovery")
@limiter.limit("10/minute")
@endpoint_exception_handler
async def confirm_2fa_password_recovery(
    request: Request,
    credentials: _2FAConfirmationBody,
    session: AsyncSession = Depends(get_session_depends),
) -> PasswordRecoveryToken:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, include_email=True, postgres_session=session
    ) as auth:
        return await auth.recover_password_2fa(credentials=credentials)


@auth.post("/auth/new/2fa")
@limiter.limit("3/minute")
@endpoint_exception_handler
async def issue_new_2fa(
    request: Request,
    email: EmailProvided,
    session: AsyncSession = Depends(get_session_depends),
) -> EmailProvided:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, include_email=True, postgres_session=session
    ) as auth:
        return await auth.issue_new_second_factor(email=email.email)


@auth.post("/auth/password-recovery")
@limiter.limit("3/minute")
@endpoint_exception_handler
async def request_password_recovery(
    request: Request,
    credentials: EmailProvided,
    session: AsyncSession = Depends(get_session_depends),
) -> EmailProvided:
    async with await MainServiceContextManager[MainServiceAuth].create(
        postgres_session=session, include_email=True, MainServiceType=MainServiceAuth
    ) as auth:
        return await auth.request_password_recovery(email=credentials.email)


@auth.patch("/auth/password-recovery")
@limiter.limit("10/minute")
@endpoint_exception_handler
async def password_recovery(
    request: Request,
    credentials: PasswordRecoveryBody,
    user_: User = Depends(authorize_password_recovery_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> RefreshAccessTokens:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(
        postgres_session=session, include_email=True, MainServiceType=MainServiceAuth
    ) as auth:
        return await auth.recover_password(user=user, credentials=credentials)


@auth.patch("/users/my-profile/password")
@limiter.limit("3/minute")
@endpoint_exception_handler
async def change_password(
    request: Request,
    credentials: ChangePasswordBody,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> RefreshAccessTokens:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(
        postgres_session=session, include_email=True, MainServiceType=MainServiceAuth
    ) as auth:
        return await auth.change_password(user=user, credentials=credentials)


@auth.post("/logout")
@limiter.limit("10/minute")
@endpoint_exception_handler
async def logout(
    request: Request,
    session: AsyncSession = Depends(get_session_depends),
    tokens: RefreshAccesTokensProvided = Body(...),
) -> None:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.logout_on_this_device(tokens=tokens)


@auth.post("/logout/full")
@limiter.limit("3/minute")
@endpoint_exception_handler
async def fully_logout(
    request: Request,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.logout_on_every_device(user=user)


@auth.post("/refresh")
@limiter.limit("10/minute")
@endpoint_exception_handler
async def refresh_token(
    request: Request,
    token=Header(..., examples="Bearer (refresh_token)"),
    session: AsyncSession = Depends(get_session_depends),
) -> AccessTokenSchema:
    async with await MainServiceContextManager[MainServiceAuth].create(
        MainServiceType=MainServiceAuth, postgres_session=session
    ) as auth:
        return await auth.refresh_token(refresh_token=token)


@auth.patch("/users/my-profile/username")
@limiter.limit("5/minute")
@endpoint_exception_handler
async def change_username(
    request: Request,
    credentials: NewUsernameBody = Body(...),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(
        postgres_session=session, MainServiceType=MainServiceAuth
    ) as auth:
        await auth.change_username(user=user, credentials=credentials)


# @auth.delete("/users/my-profile")
# @endpoint_exception_handler
# async def delete_profile(
#     password: str = Header(...),
#     user_: User = Depends(authorize_private_endpoint),
#     session: AsyncSession = Depends(get_session_depends),
# ) -> None:
#     user = await merge_model(postgres_session=session, model_obj=user_)
#     async with await MainServiceContextManager[MainServiceAuth].create(
#         postgres_session=session, MainServiceType=MainServiceAuth
#     ) as auth:
#         await auth.delete_user(password=password, user=user)
