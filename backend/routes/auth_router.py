from fastapi import APIRouter, Depends, Body, Header, File, UploadFile, Form
from services.postgres_service import *
from services.core_services import MainServiceContextManager, MainServiceAuth
from sqlalchemy.ext.asyncio import AsyncSession
from authorization.authorization_utils import authorize_access_token_depends, authorize_password_recovery_token_depends

from pydantic_schemas.pydantic_schemas_auth import *
from pydantic_schemas.pydantic_schemas_social import UserSchema

from exceptions.exceptions_handler import endpoint_exception_handler

auth = APIRouter()

@auth.post("/login")
@endpoint_exception_handler
async def login(
    credentials: LoginBody = Body(...),
    session: AsyncSession = Depends(get_session_depends)
) -> RefreshAccessTokens:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, postgres_session=session, include_email=True) as auth:
        return await auth.login(credentials=credentials)

# ADD RATE LIMITING DUE TO EMAIL SERVICE!!!!!!!
@auth.post("/register")
@endpoint_exception_handler
async def register(
    credentials: RegisterBody = Body(...),
    session: AsyncSession = Depends(get_session_depends)
) -> EmailToConfirm:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, postgres_session=session, include_email=True) as auth:
        return await auth.register(credentials=credentials)
        
@auth.post("/auth/second-factor")
@endpoint_exception_handler
async def confirm_2fa(
    confirmation_credentials: SecondFactorConfirmationBody,
    session: AsyncSession = Depends(get_session_depends)
) -> RefreshAccessTokens:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, postgres_session=session) as auth:
        return await auth.confirm_email_2fa(credentials=confirmation_credentials)
   
# ADD RATE LIMITING DUE TO EMAIL SERVICE!!!!!!!
@auth.post("/auth/new/2fa/confirm-email")
@endpoint_exception_handler
async def issue_new_second_factor(
    email: EmailToConfirm,
    session: AsyncSession = Depends(get_session_depends)
) -> None:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, include_email=True, postgres_session=session) as auth:
        return await auth.issue_new_second_factor(email=email.email_to_confirm)
       
@auth.patch("/auth/2fa/change-password")
@endpoint_exception_handler
async def recover_password(
    credentials: SecondFactorConfirmationBody,
    session: AsyncSession = Depends(get_session_depends)
) -> PasswordRecoveryToken:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, include_email=True, postgres_session=session) as auth:
        await auth.recover_password_2fa(credentials=credentials)
   
@auth.post("/users/my-profile/password")
@endpoint_exception_handler
async def request_change_password(
    user_: User = Depends(authorize_access_token_depends),
    session: AsyncSession = Depends(get_session_depends)
) -> EmailToConfirm:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(postgres_session=session, include_email=True, MainServiceType=MainServiceAuth) as auth:
        return await auth.request_password_recovery(user=user)

@auth.patch("/users/my-profile/password")
@endpoint_exception_handler
async def change_password(
    credentials: ChangePasswordBody,
    user_: User = Depends(authorize_password_recovery_token_depends),
    session: AsyncSession = Depends(get_session_depends)
) -> EmailToConfirm:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(postgres_session=session, include_email=True, MainServiceType=MainServiceAuth) as auth:
        return await auth.change_password(user=user, credentials=credentials)

@auth.post("/logout")
@endpoint_exception_handler
async def logout(
    session: AsyncSession = Depends(get_session_depends),
    tokens:RefreshAccesTokensProvided = Body(...)
) -> None:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, postgres_session=session) as auth:
        return await auth.logout(tokens=tokens)

@auth.post("/refresh")
@endpoint_exception_handler
async def refresh_token(
    token = Header(..., examples="Bearer (refresh_token)"),
    session: AsyncSession = Depends(get_session_depends)
) -> AccessTokenSchema:
    async with await MainServiceContextManager[MainServiceAuth].create(MainServiceType=MainServiceAuth, postgres_session=session) as auth:
        return await auth.refresh_token(refresh_token=token)

@auth.patch("/users/my-profile/username")
@endpoint_exception_handler
async def change_username(
    credentials: NewUsernameBody = Body(...),
    user_: User = Depends(authorize_access_token_depends),
    session: AsyncSession = Depends(get_session_depends)
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(postgres_session=session, MainServiceType=MainServiceAuth) as auth:
        await auth.change_username(user=user, credentials=credentials)
 
@auth.delete("/users/my-profile")
@endpoint_exception_handler
async def delete_profile(
    password: str = Header(...),
    user_: User = Depends(authorize_access_token_depends),
    session: AsyncSession = Depends(get_session_depends)
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainServiceAuth].create(postgres_session=session, MainServiceType=MainServiceAuth) as auth:
        await auth.delete_user(password=password, user=user)
