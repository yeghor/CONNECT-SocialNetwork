from fastapi import HTTPException

from services.core_services import MainServiceBase
from services.postgres_service import User, Post, PostImage
from services_types import ImageType
from exceptions.custom_exceptions import EmptyPostsError
from typing import Tuple, Literal
import mimetypes
import os
import aiofiles
from uuid import uuid4
import magic

from exceptions.exceptions_handler import web_exceptions_raiser
from exceptions.custom_exceptions import *

MEDIA_AVATAR_PATH = os.getenv("MEDIA_AVATAR_PATH", "media/users/")
MEDIA_POST_IMAGE_PATH = os.getenv("MEDIA_POST_IMAGE_PATH", "media/posts/")
MAX_NUMBER_POST_IMAGES = int(os.getenv("MAX_NUMBER_POST_IMAGES", "3"))
POST_IMAGE_MAX_SIZE_MB = int(os.getenv("POST_IMAGE_MAX_SIZE_MB"))

ALLOWED_IMAGES_EXTENSIONS_MIME_RAW = os.getenv("ALLOWED_IMAGES_EXTENSIONS_MIME")
ALLOWED_EXTENSIONS = ALLOWED_IMAGES_EXTENSIONS_MIME_RAW.split(",")
for i, ext in enumerate(ALLOWED_EXTENSIONS):
    ALLOWED_EXTENSIONS[i] = ext.strip()


MEDIA_AVATAR_PATH = os.getenv("MEDIA_AVATAR_PATH", "media/users/")
MEDIA_POST_IMAGE_PATH = os.getenv("MEDIA_POST_IMAGE_PATH", "media/posts/")
MEDIA_AVATAR_PATH_TEST = os.getenv(
    "MEDIA_AVATAR_PATH_TEST", "media/testing_media/users"
)
MEDIA_POST_IMAGE_PATH_TEST = os.getenv(
    "MEDIA_POST_IMAGE_PATH_TEST", "media/testing_media/posts"
)


class MainMediaService(MainServiceBase):
    @staticmethod
    def _guess_mime(file_bytes: bytes) -> str:
        """Guesses mime type from tile bytes"""
        return magic.from_buffer(buffer=file_bytes, mime=True)

    @staticmethod
    def _define_image_name(id_: str, image_type: ImageType, n_image: int = None) -> str:
        """Pass `n_image` only if `image_type` set to `'post'`"""
        if image_type == "post":
            if not isinstance(n_image, int):
                raise ValueError("No valid post image number wasn't specified")
            return f"{id_}-{n_image}"
        if image_type == "user":
            return id_
        else:
            raise ValueError("Unsupported image type!")

    @staticmethod
    async def _read_contents_and_mimetype_by_filepath(
        filepath: str,
    ) -> Tuple[bytes, str]:
        """Returns (`bytes`, `str`) where `bytes` - image contents, `str` - mimetype"""
        async with aiofiles.open(file=filepath, mode="rb") as file_:
            contents = await file_.read()

        # Return value is a tuple (type, encoding) where type is None if the type can't be guessed
        content_type = mimetypes.guess_type(filepath)[0]

        if not content_type:
            raise MediaStorageException(
                f"MediaService: Can't guess image type by it's contents."
            )

        return (contents, content_type)

    @staticmethod
    async def _get_extension(content_type: str, image_name: str) -> str:
        # Return value is a string giving a filename extension, including the leading dot ('.') / mimetypes.guess_extension()
        extension = mimetypes.guess_extension(type=content_type)
        if not extension:
            raise InvalidFileMimeType(
                detail=f"Local Storage: User {image_name} tried to upload post image with corrupted mime type - {content_type}",
                client_safe_detail=f"Invalid image type. Allowed only - {ALLOWED_EXTENSIONS}",
            )
        return extension

    @staticmethod
    def _validate_file_size(bytes_obj: bytes) -> bool:
        return 0 < len(bytes_obj) / 1024 / 1024 < POST_IMAGE_MAX_SIZE_MB

    def _validate_image_mime(self, image_bytes: bytes, specified_mime: str) -> bool:
        """Validate specified mime_type"""
        # TODO: Could reject valid file
        extension_mime = self._guess_mime(file_bytes=image_bytes)

        print(extension_mime)

        splitted_mime = extension_mime.split("/")
        print(splitted_mime)
        if len(splitted_mime) != 2:
            return False

        if not extension_mime.startswith("image/"):
            return False

        if not splitted_mime[1] in ALLOWED_EXTENSIONS:
            return False

        if extension_mime != specified_mime:
            return False

        return True

    async def _validate_image(
        self, contents: bytes, content_type: str, image_name: str
    ) -> None:
        if not self._validate_image_mime(
            image_bytes=contents, specified_mime=content_type
        ):
            raise InvalidFileMimeType(
                detail=f"Local Storage: User {image_name} tried to upload avatar with wrong mime type",
                client_safe_detail=f"Invalid image type. Allowed only - {ALLOWED_EXTENSIONS}",
            )

        if not self._validate_file_size(bytes_obj=contents):
            raise InvalidResourceProvided(
                detail=f"Local Storage: User {image_name} tried to uploaded avatar bigger than {POST_IMAGE_MAX_SIZE_MB}mb",
                client_safe_detail=f"Image is too big. Size up to {POST_IMAGE_MAX_SIZE_MB}mb",
            )

    def _validate_incoming_file(
        self, user_id: str | None, contents: bytes, mime_type: str
    ):
        """
        Must be wrapper into @web_exception_raiser
        user_id is optional for clarity in exception logs
        """

        if not self._validate_image_mime(
            image_bytes=contents, specified_mime=mime_type
        ):
            raise InvalidResourceProvided(
                detail=f"S3 Storage: User {user_id} tried to upload image with wrong mime type",
                client_safe_detail=f"Invalid image type. Allowed only - {ALLOWED_EXTENSIONS}",
            )

        if not self._validate_file_size(bytes_obj=contents):
            raise InvalidResourceProvided(
                detail=f"S3 Storage: User {user_id} tried to upload image bigger than {POST_IMAGE_MAX_SIZE_MB}mb",
                client_safe_detail=f"Image is too big. Size up to {POST_IMAGE_MAX_SIZE_MB}mb",
            )

    async def get_name_and_check_token(self, token: str, image_type: ImageType):
        """
        Get image name from Redis. If it's not exist - raises HTTPexception 401 \n
        """
        image_name = await self._RedisService.check_image_access(
            url_image_token=token, image_type=image_type
        )

        if image_name:
            return image_name
        raise Unauthorized(
            detail=f"MediaService: User with media token: {token} (image type: {image_type}) that does not exist tried to get image.",
            client_safe_detail="Invalid or expired token",
        )

    @web_exceptions_raiser
    async def upload_post_image(
        self, post_id: str, user: User, image_contents: bytes, specified_mime: str
    ) -> None:
        if image_contents and specified_mime:
            self._validate_incoming_file(
                user_id=user.user_id, contents=image_contents, mime_type=specified_mime
            )

            post = await self._PostgresService.get_entry_by_id(
                id_=post_id, ModelType=Post
            )

            if not post:
                raise ResourceNotFound(
                    detail=f"MediaService: User: {user.user_id} tried to upload post image to post: {post_id} that does not exist.",
                    client_safe_detail="You are trying to upload image to post that does not exist",
                )

            if post.owner_id != user.user_id:
                raise Unauthorized(
                    detail=f"MediaService: User: {user.user_id} tried to upload image to post: {post.post_id} not being it's owner.",
                    client_safe_detail=f"You can't upload image to post that you're not own",
                )

            if len(post.images) >= MAX_NUMBER_POST_IMAGES:
                raise LimitReached(
                    detail=f"MediaService: User: {User.user_id} tried to upload more than {MAX_NUMBER_POST_IMAGES} images to post: {post.post_id}",
                    client_safe_detail=f"You can't upload more that {MAX_NUMBER_POST_IMAGES} to a single post",
                )

            image_name = self._define_image_name(
                id_=post_id, image_type="post", n_image=len(post.images)
            )

            mime_type = self._guess_mime(file_bytes=image_contents)
            extension = await self._get_extension(
                content_type=mime_type, image_name=image_name
            )

            image_entry = PostImage(
                image_id=str(uuid4()), post_id=post_id, image_name=image_name
            )
            await self._PostgresService.insert_models_and_flush(image_entry)

            await self._ImageStorage.upload_images_post(
                contents=image_contents,
                content_type=specified_mime,
                full_image_name=f"{image_name}{extension}",
            )
        else:
            raise InvalidResourceProvided(
                detail=f"MediaService: User: {user.user_id} tried to upload image to post: {post_id} with missing image contents: {image_contents[:10]} or mime type: {specified_mime}"
            )

    @web_exceptions_raiser
    async def upload_user_avatar(
        self, user: User, image_contents: bytes, specified_mime: str
    ):
        if image_contents and specified_mime:
            self._validate_incoming_file(
                user_id=user.user_id, contents=image_contents, mime_type=specified_mime
            )

            if user.avatar_image_name:
                await self._ImageStorage.delete_avatar_user(image_name=user.user_id)

            mime_type = self._guess_mime(file_bytes=image_contents)
            extension = await self._get_extension(
                content_type=mime_type, image_name=user.user_id
            )

            await self._ImageStorage.upload_avatar_user(
                contents=image_contents,
                content_type=specified_mime,
                full_image_name=f"{user.user_id}{extension}",
            )

            user.avatar_image_name = user.user_id
            await self._PostgresService.flush()

        else:
            raise InvalidResourceProvided(
                detail=f"MediaService: User: {user.user_id} tried to upload avatar with missing image contents: {image_contents[:10]} or mime type: {specified_mime}"
            )

    @web_exceptions_raiser
    async def get_user_avatar_by_token(self, token: str) -> Tuple[bytes, str]:
        """Returns single image (contents, mime_type) from granted token"""
        avatar_name = await self.get_name_and_check_token(
            token=token, image_type="user"
        )

        filepath = f"{MEDIA_AVATAR_PATH}{avatar_name}"
        return await self._read_contents_and_mimetype_by_filepath(filepath=filepath)

    @web_exceptions_raiser
    async def get_post_image_by_token(self, token: str) -> Tuple[bytes, str]:
        """Returns single image (contents, mime_type) from granted token"""

        image_name = await self.get_name_and_check_token(token=token, image_type="post")

        filepath = f"{MEDIA_POST_IMAGE_PATH}{image_name}"

        return await self._read_contents_and_mimetype_by_filepath(filepath=filepath)
