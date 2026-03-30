import jwt
from dotenv import load_dotenv
from os import getenv
from datetime import datetime, timedelta, timezone
from services.redis_service import RedisService
from typing import Dict, TypeVar, Type
from services_types import EndpointAuthType
from pydantic_schemas.pydantic_schemas_auth import *
import jwt.exceptions as jwt_exceptions
from functools import wraps
from pydantic_schemas.pydantic_schemas_chat import ChatJWTPayload
from exceptions.custom_exceptions import *
from pydantic import BaseModel

load_dotenv()

DATETIME_BASE_FORMAT = getenv("DATETIME_BASE_FORMAT")

M = TypeVar("M", bound=BaseModel)


def jwt_error_handler(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except jwt_exceptions.DecodeError as e:
            raise InvalidResourceProvided(
                detail=f"JWTService: JWT Token decoding failed. Function - {func.__name__}",
                client_safe_detail="Authorization token is not valid",
            ) from e
        except jwt_exceptions.PyJWTError as e:
            raise InvalidResourceProvided(
                detail=f"JWTService: Invalid or malformed JWT token. Function - {func.__name__}",
                client_safe_detail="Authorization token is not valid",
            ) from e
        except JWTError as e:
            raise e from e
        except Exception as e:
            raise JWTError(
                f"JWTService: Unknown exception occured. Function - {func.__name__}. Exception - {e}"
            ) from e

    return wrapper


class JWTService:
    """Every method call must be wrapped into @endpoint_exception_handler"""

    @classmethod
    def _prepare_token(cls, jwt_token: str) -> str:
        """
        This method validates and removes "Bearer " prefix from token
        """
        if not jwt_token.startswith("Bearer ") or not jwt_token:
            raise ValidationExc(
                detail=f"JWTService: provided jwt: {jwt_token} did not pass startswith('Bearer') check.",
                client_safe_detail="Invalid token",
            )
        return jwt_token.removeprefix("Bearer ")

    @classmethod
    @jwt_error_handler
    def _generate_token(cls, user_id: str, issued_at_unix: int) -> str:
        encoded_jwt = jwt.encode(
            payload={
                "user_id": str(user_id),
                "issued_at": issued_at_unix,
            },
            key=getenv("SECRET_KEY"),
            algorithm="HS256",
        )
        return encoded_jwt

    @staticmethod
    def _increment_date_with_seconds(date: datetime, seconds: int) -> datetime:
        return date + timedelta(seconds=seconds)

    @classmethod
    @jwt_error_handler
    async def generate_save_token(
        cls, user_id: str, redis: RedisService, token_type: EndpointAuthType
    ) -> RefreshTokenSchema | AccessTokenSchema | PasswordRecoveryToken:
        """Choose token type you want to generate - acces/refresh"""

        now = datetime.now(timezone.utc)

        encoded_jwt = cls._generate_token(user_id, issued_at_unix=int(now.timestamp()))

        if token_type == "acces":
            expires_at_seconds = await redis.save_acces_jwt(
                jwt_token=encoded_jwt, user_id=user_id
            )
            expires_at = cls._increment_date_with_seconds(now, expires_at_seconds)
            return AccessTokenSchema(
                access_token=encoded_jwt, expires_at_access=expires_at
            )
        elif token_type == "refresh":
            expires_at_seconds = await redis.save_refresh_jwt(
                jwt_token=encoded_jwt, user_id=user_id
            )
            expires_at = cls._increment_date_with_seconds(now, expires_at_seconds)
            return RefreshTokenSchema(
                refresh_token=encoded_jwt, expires_at_refresh=expires_at
            )
        elif token_type == "password-recovery":
            expires_at_seconds = await redis.save_password_recovery_jwt(
                jwt_token=encoded_jwt, user_id=user_id
            )
            expires_at = cls._increment_date_with_seconds(now, expires_at_seconds)
            return PasswordRecoveryToken(
                recovery_token=encoded_jwt, expires_at_recovery=expires_at
            )
        else:
            raise ValueError("Unsuported token type")

    @classmethod
    @jwt_error_handler
    async def generate_save_set_of_refresh_access_tokens(
        cls,
        redis: RedisService,
        user_id: str,
        email_confirmation_required: bool = False,
    ) -> RefreshAccessTokens:
        access_token = await cls.generate_save_token(
            user_id=user_id, redis=redis, token_type="acces"
        )
        refresh_token = await cls.generate_save_token(
            user_id=user_id, redis=redis, token_type="refresh"
        )

        return RefreshAccessTokens(
            access_token=access_token.access_token,
            expires_at_access=access_token.expires_at_access,
            refresh_token=refresh_token.refresh_token,
            expires_at_refresh=refresh_token.expires_at_refresh,
            email_confirmation_required=email_confirmation_required,
        )

    @classmethod
    @jwt_error_handler
    def extract_jwt_payload(cls, jwt_token: str) -> PayloadJWT:
        payload = jwt.decode(
            jwt=jwt_token,
            key=getenv("SECRET_KEY"),
            algorithms=[
                "HS256",
            ],
        )

        return PayloadJWT.model_validate(payload)

    @classmethod
    @jwt_error_handler
    async def generate_save_chat_token(
        cls, room_id: str, user_id: str, redis: RedisService
    ) -> str:
        chat_token = cls.generate_chat_token(room_id=room_id, user_id=user_id)
        await redis.save_chat_token(chat_token=chat_token, user_id=user_id)
        return chat_token

    @classmethod
    @jwt_error_handler
    def generate_chat_token(cls, room_id: str, user_id: str) -> str:
        payload = {
            "room_id": room_id,
            "user_id": user_id,
            # to make tokens unique
            "issued": datetime.utcnow().strftime(DATETIME_BASE_FORMAT),
        }
        return jwt.encode(payload=payload, key=getenv("SECRET_KEY"), algorithm="HS256")

    @classmethod
    @jwt_error_handler
    def extract_chat_jwt_payload(cls, jwt_token: str) -> ChatJWTPayload:
        payload = jwt.decode(
            jwt=jwt_token,
            key=getenv("SECRET_KEY"),
            algorithms=[
                "HS256",
            ],
        )
        return ChatJWTPayload.model_validate(payload)
