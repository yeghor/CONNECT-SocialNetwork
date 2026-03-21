from fastapi import APIRouter, Depends, UploadFile, File, Request
from fastapi.responses import Response

from authorization.authorization_utils import authorize_private_endpoint
from services.postgres_service.models import User
from services.postgres_service.database_utils import *
from sqlalchemy.ext.asyncio import AsyncSession
from services.core_services import MainServiceContextManager
from services.core_services.main_services.main_media_service import MainMediaService

from exceptions.exceptions_handler import endpoint_exception_handler

from main import limiter

media = APIRouter()

"""
This router is only for case when the application use Local image storage.
"""


# https://stackoverflow.com/questions/55873174/how-do-i-return-an-image-in-fastapi
@media.get("/media/users/{token}", response_class=Response)
@limiter.limit("500/minute")
@endpoint_exception_handler
async def get_image_user(
    request: Request,
    token: str, session: AsyncSession = Depends(get_session_depends)
) -> Response:
    async with await MainServiceContextManager[MainMediaService].create(
        MainServiceType=MainMediaService, postgres_session=session
    ) as media:
        file_contents, mime_type = await media.get_user_avatar_by_token(token=token)
        return Response(content=file_contents, media_type=mime_type)


@media.get("/media/posts/{token}", response_class=Response)
@limiter.limit("500/minute")
@endpoint_exception_handler
async def get_image_post(
    request: Request,
    token: str, session: AsyncSession = Depends(get_session_depends)
) -> Response:
    async with await MainServiceContextManager[MainMediaService].create(
        MainServiceType=MainMediaService, postgres_session=session
    ) as media:
        file_contents, mime_type = await media.get_post_image_by_token(token=token)
        return Response(content=file_contents, media_type=mime_type)


@media.post("/media/posts/{post_id}")
@limiter.limit("300/minute") # rate must be [max post pictures] * [make_post rate]
@endpoint_exception_handler
async def upload_post_picture(
    request: Request,
    post_id: str,
    file: UploadFile = File(...),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    print("Received upload post picture")
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainMediaService].create(
        MainServiceType=MainMediaService, postgres_session=session
    ) as media:
        file_contents = await file.read()
        await media.upload_post_image(
            post_id=post_id,
            user=user,
            image_contents=file_contents,
            specified_mime=file.content_type,
        )


@media.post("/media/my-profile/avatar")
@limiter.limit("100/minute")
@endpoint_exception_handler
async def upload_user_avatar(
    request: Request,
    file: UploadFile = File(...),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainMediaService].create(
        MainServiceType=MainMediaService, postgres_session=session
    ) as media:
        file_contents = await file.read()
        await media.upload_user_avatar(
            user=user, image_contents=file_contents, specified_mime=file.content_type
        )
