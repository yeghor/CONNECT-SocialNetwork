from .models import Base
from .database import get_engine, get_sessionlocal

from sqlalchemy.ext.asyncio import AsyncSession
from functools import wraps
from sqlalchemy.exc import SQLAlchemyError, MultipleResultsFound
from typing import TypeVar
from exceptions.custom_exceptions import PostgresError, MultipleDataFound
from os import getenv

MAX_FOLLOWED_POSTS_TO_SHOW = int(getenv("MAX_FOLLOWED_POSTS_TO_SHOW"))

ModelT = TypeVar("Models", bound=Base)

async def get_session_depends():
    """
    Automatically closes session.\n
    Use with fastAPI Depends()!
    """
    try:
        engine = await get_engine()
        SessionLocal = get_sessionlocal(engine=engine)
        async with SessionLocal() as conn:
            yield conn
    finally:
        await engine.dispose()

def postgres_exception_handler(action: str = "Unknown action with the database"):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                if isinstance(e, MultipleResultsFound):
                    raise MultipleDataFound(f"Postgres: Multiple results found in - {func.__name__}. Action - {action}. Exception - {e}") from e
                elif isinstance(e, SQLAlchemyError):
                    raise PostgresError(
                        f"Postgres: Postgres error occured in : {func.__name__}. Action: {action}. Exception - {e}") from e
                else:
                    raise PostgresError(f"Postgres: Uknown error occured in : {func.__name__}. Action: {action}. Exception - {e}") from e
        return wrapper
    return decorator

async def get_session() -> AsyncSession:
    try:
        engine = await get_engine()
        SessionLocal = get_sessionlocal(engine=engine)
        return SessionLocal()
    finally:
        await engine.dispose()

async def merge_model(postgres_session: AsyncSession, model_obj: ModelT) -> ModelT:
    """Caution! When merging old model. It can clear all loaded relationsghips via `options(selectinload(...))`"""
    return await postgres_session.merge(model_obj)