import magic
import mimetypes
from abc import ABC, abstractmethod

from services.redis_service import RedisService

from aiobotocore.session import get_session
from botocore.exceptions import ClientError, NoCredentialsError, EndpointConnectionError
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from typing import List, Literal, Dict, Callable
import glob
from functools import wraps

from exceptions.custom_exceptions import *

# LocalStorage service can't be async. So we're using aiofiles's run_in_executor() wrap
import aiofiles

load_dotenv()
POST_IMAGE_MAX_SIZE_MB = int(os.getenv("POST_IMAGE_MAX_SIZE_MB", "25"))
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_BUCKET_NAME_TEST = os.getenv("S3_BUCKET_NAME_TEST")
IMAGE_VIEW_ACCES_SECONDS = int(os.getenv("IMAGE_VIEW_ACCES_SECONDS", "180"))
MAX_NUMBER_POST_IMAGES = int(os.getenv("MAX_NUMBER_POST_IMAGES", "3"))

MEDIA_AVATAR_PATH = os.getenv("MEDIA_AVATAR_PATH", "media/users/")
MEDIA_POST_IMAGE_PATH = os.getenv("MEDIA_POST_IMAGE_PATH", "media/posts/")
MEDIA_AVATAR_PATH_TEST = os.getenv(
    "MEDIA_AVATAR_PATH_TEST", "media/testing_media/users"
)
MEDIA_POST_IMAGE_PATH_TEST = os.getenv(
    "MEDIA_POST_IMAGE_PATH_TEST", "media/testing_media/posts"
)


BASE_URL = os.getenv("LOCAL_BASE_URL", "http://127.0.0.1:8000")
MEDIA_POST_IMAGE_URI = os.getenv("MEDIA_POST_IMAGE_URI", "/media/posts/")
USER_AVATAR_URI = os.getenv("USER_AVATAR_URI", "media/users/")



# https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html
def media_storage_exception_handler_s3(func: Callable):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ClientError as e:
            raise MediaStorageException(
                f"MediaStorage-S3: client error occured, code: {e["Error"]["Code"]}, function: {func.__name__}"
            ) from e
        except MediaStorageException as e:
            raise e
        except Exception as e:
            raise MediaStorageException(
                f"MediaStorage-S3: uknown exception occured, exception: {e}, function: {func.__name__}"
            ) from e

    return wrapper


# https://docs.aws.amazon.com/boto3/latest/guide/error-handling.html
def media_storage_exception_handler_local(func: Callable):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            raise MediaStorageException(
                f"MediaStorage-Local: exception occured, exception: {e}, function: {func.__name__}"
            ) from e

    return wrapper


# TODO: webp format not working


class ImageStorageABC(ABC):
    """
    Every method call must be wrapper into @web_exception_raiser decorator
    Image contents must be already validated
    """

    @abstractmethod
    def upload_images_post(
        self, contents: bytes, content_type: str, full_image_name: str
    ):
        """
        Updates or uploads single post picture
        full_image_name must include extenstion
        """

    @abstractmethod
    async def upload_avatar_user(
        self, contents: bytes, content_type: str, full_image_name: str
    ) -> None:
        """
        Updates or uploads user avatar
        full_image_name must include extenstion
        """

    @abstractmethod
    async def delete_post_images(self, image_name: str) -> None:
        """Delete n's post image. If no image - pass"""

    @abstractmethod
    async def delete_avatar_user(self, image_name: str) -> None:
        """Deletes user avatar. If not image - pass"""

    @abstractmethod
    async def get_post_image_urls(self, images_names: str) -> List[str]:
        """Get temprorary n's post image URL with jwt token in URL including. Returns empty list, if not post image"""

    @abstractmethod
    async def get_user_avatar_url(self, image_name: str) -> str | None:
        """Returns temprorary user avatar URL. Returns None, if no user avatar"""


# S3 Implementation

class S3Storage(ImageStorageABC):
    # redis argument for compatibility with other implementations
    def __init__(self, mode: Literal["prod", "test"], redis: RedisService | None):
        self._session = get_session()

        if mode == "prod":
            self._bucket_name = S3_BUCKET_NAME
        elif mode == "test":
            self._bucket_name = S3_BUCKET_NAME_TEST
        else:
            raise MediaStorageException("MediaStorage-S3: Unsupported running mode")

    @asynccontextmanager
    async def _client(self):
        async with self._session.create_client("s3") as client:
            yield client

    def _define_boto_params(self, key: str) -> Dict[str, str]:
        return {"Bucket": self._bucket_name, "Key": key}

    @media_storage_exception_handler_s3
    async def upload_images_post(
        self, contents: bytes, content_type: str, full_image_name: str
    ) -> None:
        async with self._client() as s3:
            await s3.put_object(
                Bucket=self._bucket_name,
                Key=full_image_name,
                Body=contents,
                ContentType=content_type,
            )

    @media_storage_exception_handler_s3
    async def upload_avatar_user(
        self, contents: bytes, mime_type: str, full_image_name: str
    ) -> None:
        async with self._client() as s3:
            await s3.put_object(
                Bucket=self._bucket_name,
                Key=full_image_name,
                Body=contents,
                ContentType=mime_type,
            )

    @media_storage_exception_handler_s3
    async def delete_post_images(self, image_name: str) -> None:
        async with self._client() as s3:
            await s3.delete_object(Bucket=self._bucket_name, Key=image_name)

    @media_storage_exception_handler_s3
    async def delete_avatar_user(self, image_name: str) -> None:
        async with self._client() as s3:
            await s3.delete_object(Bucket=self._bucket_name, Key=image_name)

    @media_storage_exception_handler_s3
    async def get_user_avatar_url(self, image_name: str) -> str:
        async with self._client() as s3:
            return await s3.generate_presigned_url(
                "get_object",
                Params=self._define_boto_params(key=image_name),
                ExpiresIn=IMAGE_VIEW_ACCES_SECONDS,
            )

    @media_storage_exception_handler_s3
    async def get_post_image_urls(self, images_names: List[str]) -> List[str]:
        async with self._client() as s3:
            urls = []
            for image_name in images_names:
                url = await s3.generate_presigned_url(
                    "get_object",
                    Params=self._define_boto_params(key=image_name),
                    ExpiresIn=IMAGE_VIEW_ACCES_SECONDS,
                )
                if url:
                    urls.append(url)

            return urls


# Local storage implementation

import secrets


class LocalStorage(ImageStorageABC):
    @staticmethod
    def _generate_url_token() -> str:
        return secrets.token_urlsafe()

    def __init__(self, mode: Literal["prod", "test"], Redis: RedisService):
        self._Redis = Redis

        if mode == "prod":
            self.__media_avatar_path = MEDIA_AVATAR_PATH
            self.__media_post_path = MEDIA_POST_IMAGE_PATH
        elif mode == "test":
            self.__media_avatar_path = MEDIA_AVATAR_PATH_TEST
            self.__media_post_path = MEDIA_POST_IMAGE_PATH_TEST

    @media_storage_exception_handler_local
    async def upload_images_post(
        self, contents: bytes, content_type: str, full_image_name: str
    ) -> None:
        async with aiofiles.open(
            file=f"{self.__media_post_path}/{full_image_name}", mode="wb"
        ) as file_:
            await file_.write(contents)

    @media_storage_exception_handler_local
    async def upload_avatar_user(
        self, contents: bytes, content_type: str, full_image_name: str
    ) -> None:
        async with aiofiles.open(
            file=f"{self.__media_avatar_path}/{full_image_name}", mode="wb"
        ) as file_:
            await file_.write(contents)

    @media_storage_exception_handler_local
    async def delete_post_images(self, base_name: str) -> None:
        """Pass to `base_name` image name that includes same part, like post_id without image ordinal number"""
        # Whe don't know file extension. So we need to find it using glob and image_name*

        filenames = glob.glob(f"{base_name}*", root_dir=self.__media_post_path)
        for filename in filenames:
            filepath = f"{self.__media_post_path}{filename}"

            if os.path.exists(path=filepath):
                try:
                    os.remove(path=filepath)
                except Exception as e:
                    raise MediaStorageException(
                        f"Local Storage: Failed delete post image localy. Filepath - {filename}. Exception - {e}"
                    ) from e
            else:
                return

    @media_storage_exception_handler_local
    async def delete_avatar_user(self, image_name: str) -> None:
        # Program does not know the file extension. So we need to find it using glob and image_name*
        filenames = glob.glob(f"{image_name}*", root_dir=self.__media_avatar_path)

        if not filenames:
            return

        if len(filenames) > 1:
            raise ValueError("Multiple images was found. Aborting.")

        filename = filenames[0]
        filepath = f"{self.__media_avatar_path}{filename}"

        if os.path.exists(path=filepath):
            try:
                os.remove(path=filepath)
            except Exception as e:
                raise MediaStorageException(
                    f"Local Storage: Failed delete user avatar localy. Filepath - {filename}. Exception - {e}"
                ) from e
        else:
            return

    @media_storage_exception_handler_local
    async def get_post_image_urls(self, images_names: List[str]) -> List[str]:
        urls = []
        for provided_filename in images_names:
            filenames = glob.glob(
                pathname=f"{provided_filename}*", root_dir=self.__media_post_path
            )
            if not filenames:
                continue
            filename = filenames[0]

            urfsafe_token = self._generate_url_token()

            await self._Redis.save_url_post_token(
                image_token=urfsafe_token, image_name=filename
            )
            url = f"{BASE_URL}{MEDIA_POST_IMAGE_URI}{urfsafe_token}"
            urls.append(url)

        return urls

    @media_storage_exception_handler_local
    async def get_user_avatar_url(self, image_name: str) -> str | None:
        # Searching for potential
        filenames = glob.glob(f"{image_name}*", root_dir=self.__media_avatar_path)
        if not filenames:
            return None
        filename = filenames[0]

        urlsafe_token = self._generate_url_token()

        await self._Redis.save_url_user_token(
            image_token=urlsafe_token, image_name=filename
        )

        return f"{BASE_URL}{USER_AVATAR_URI}{urlsafe_token}"
