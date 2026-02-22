from sqlalchemy import select, delete, update, or_, inspect, and_, func, union
from sqlalchemy.orm import selectinload, aliased
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv
from os import getenv
from typing import Type, TypeVar, List, Dict
from pydantic_schemas.pydantic_schemas_social import PostDataSchemaID
from uuid import UUID
from .models import *
from .models import ActionType
from .database_utils import postgres_exception_handler
from project_types import PostsOrderType
from exceptions.custom_exceptions import PostgresError

Models = TypeVar("Models", bound=Base)

load_dotenv()

FEED_MAX_POSTS_LOAD = int(getenv("FEED_MAX_POSTS_LOAD"))

MAX_FOLLOWED_POSTS_TO_SHOW = int(getenv("MAX_FOLLOWED_POSTS_TO_SHOW"))
RETURN_REPLIES = int(getenv("RETURN_REPLIES"))
LOAD_MAX_USERS_POST = int(getenv("LOAD_MAX_USERS_POST"))

BASE_PAGINATION = int(getenv("BASE_PAGINATION"))
DIVIDE_BASE_PAG_BY = int(getenv("DIVIDE_BASE_PAG_BY"))
SMALL_PAGINATION = int(getenv("SMALL_PAGINATION"))

class PostgresService:
    @staticmethod
    def define_posts_order_by(order: PostsOrderType):
        match order:
            case "fresh":
                return Post.published.desc()
            case "popularNow":
                return Post.popularity_rate.desc()
            case "old":
                return Post.published
            case "mostLiked":
                return Post.likes_count.desc()

    def __init__(self, postgres_session: AsyncSession):
        # We don't need to close session. Because Depends func will handle it in endpoints.
        self.__session = postgres_session

    @postgres_exception_handler(action="Close session")
    async def close(self) -> None:
        await self.__session.aclose()

    @postgres_exception_handler(action="Commit session")
    async def commit_changes(self) -> None:
        await self.__session.commit()

    @postgres_exception_handler(action="Rollback session")
    async def rollback(self) -> None:
        await self.__session.rollback()

    @postgres_exception_handler(action="Refresh session model")
    async def refresh_model(self, model_obj: Base) -> None:
        await self.__session.refresh(model_obj)

    @postgres_exception_handler(action="Flush session")
    async def flush(self) -> None:
        await self.__session.flush()

    @postgres_exception_handler(action="Delete model session")
    async def delete_models_and_flush(self, *models: Base) -> None:
        for model in models:
            await self.__session.delete(model)
        await self.flush()

    @postgres_exception_handler(action="Add model and flush")
    async def insert_models_and_flush(self, *models: Base):
        self.__session.add_all(models)
        await self.__session.flush()

    @postgres_exception_handler(action="Get user by id")
    async def get_user_by_id(self, user_id: str) -> User | None:
        result = await self.__session.execute(
            select(User)
            .options(selectinload(User.followed), selectinload(User.followers))
            .where(User.user_id == user_id)
        )
        return result.scalar()

    @postgres_exception_handler(action="Get fresh feed")
    async def get_fresh_posts(self, user: User | None, page: int, n: int, exclude_ids: List[str]) -> List[Post]:
        if user:
            filtering_stmt = (and_(Post.owner_id != user.user_id, Post.post_id.not_in(exclude_ids)))
        else:
            filtering_stmt = (Post.post_id.not_in(exclude_ids))
        
        result = await self.__session.execute(
            select(Post)
            .where(filtering_stmt)
            .order_by(Post.popularity_rate.desc(), Post.published.desc())
            .options(selectinload(Post.parent_post))
            .offset((page*n))
            .limit(n)
        )
        return result.scalars().all()

    @postgres_exception_handler(action="Get all posts")
    async def get_all_from_model(self, ModelType: Type[Models]) -> List[Models]:
        result = await self.__session.execute(
            select(ModelType)
        )
        return result.scalars().all()

    @postgres_exception_handler(action="Get entries from specific model by ids")
    async def get_entries_by_ids(self, ids: List[str], ModelType: Type[Models]) -> List[Models]:     
        if not ids:
            return []

        if ModelType == User:
            result = await self.__session.execute(
                select(User)
                .where(User.user_id.in_(ids))
                .options(selectinload(User.followed), selectinload(User.followers))
            )
        elif ModelType == Post:
            result = await self.__session.execute(
                select(Post)
                .where(Post.post_id.in_(ids))
                .options(selectinload(Post.parent_post))
            )
        else:
            raise TypeError("Unsupported model type!")
        return result.scalars().all()
    
    @postgres_exception_handler(action="Get entry from id")
    async def get_entry_by_id(self, id_: str, ModelType: Type[Models]) -> Models:
        if ModelType == User:
            result = await self.__session.execute(
                select(User)
                .where(User.user_id == id_)
                .options(selectinload(User.followers), selectinload(User.followed), selectinload(User.posts))
            )
        elif ModelType == Post:
            result = await self.__session.execute(
                select(Post)
                .where(Post.post_id == id_)
                .options(selectinload(Post.replies), selectinload(Post.parent_post))
            )
        else:
            raise TypeError("Unsupported model type!")
        return result.scalar()

    # https://stackoverflow.com/questions/3325467/sqlalchemy-equivalent-to-sql-like-statement
    @postgres_exception_handler(action="Get users by LIKE statement")
    async def get_users_by_username(self, query: str, page: int, n: int) -> List[User]:
        result = await self.__session.execute(
            select(User)
            .where(User.username.ilike(f"%{query.strip()}%"))
            .options(selectinload(User.followers))
            .offset((page*n))
            .limit(n)
        )
        return result.scalars().all()

    @postgres_exception_handler(action="Get user's friends")
    async def get_friendships(self, user: User) -> List[User]:
        # I don't understand how it works for god sake, taken from AI.
        # I promise, that in future I will come back to this.
        F1 = aliased(Friendship)
        F2 = aliased(Friendship)

        stmt = (
            select(User)
            .options(selectinload(User.followers))
            .join(F1, F1.followed_id == User.user_id)
            .join(F2, F2.follower_id == User.user_id)
            .where(
                F1.follower_id == user.user_id,
                F2.followed_id == user.user_id,
            )
        )
        
        result = await self.__session.execute(stmt)
        return result.scalars().all()

    @postgres_exception_handler(action="Change field and flush")
    async def change_field_and_flush(self, model: Base, **kwargs) -> None:
        for key, value in kwargs.items():
            setattr(model, key, value)
        await self.__session.flush()

    @postgres_exception_handler(action="Delete post by id")
    async def delete_post_by_id(self, id_: str) -> None:
        await self.__session.execute(
            delete(Post)
            .where(Post.post_id == id_)
        )

    @postgres_exception_handler(action="Get user by username and email")
    async def get_user_by_username_or_email(self, username: str | None = None, email: str | None = None) -> User | None:
        if not username and not email:
            raise ValueError("Username AND email are None!")

        result = await self.__session.execute(
            select(User)
            .where(or_(User.username == username, User.email == email))
            .limit(1)
        )

        return result.scalar()
    
    @postgres_exception_handler(action="Get followed users posts")
    async def get_followed_posts(self, user: User, n: int, page: int, exclude_ids: List[str] = []) -> List[Post]:
        """If user not following anyone - returns empty list"""

        # Getting new user, because merged instances may not include loaded relationships
        user = await self.get_user_by_id(user_id=user.user_id)

        followed_ids = [followed.user_id for followed in user.followed]

        result = await self.__session.execute(
            select(Post)
            .where(and_(Post.owner_id.in_(followed_ids), Post.post_id.not_in(exclude_ids)))
            .order_by(Post.popularity_rate.desc(), Post.published.desc())
            .options(selectinload(Post.parent_post))
            .offset(page*n)
            .limit(n)
        )
        return result.scalars().all()


    @postgres_exception_handler(action="Update post values nad return post is needed")
    async def update_post_fields(self, post_data: PostDataSchemaID, return_updated_post: bool = False) -> Post | None:
        post_data_dict = post_data.model_dump(exclude_defaults=True, exclude_none=True, exclude={"post_id"})
        if not post_data_dict:
            return
        
        await self.__session.execute(
            update(Post)
            .where(Post.post_id == post_data.post_id)
            .values(**post_data_dict)
        )
        if return_updated_post:
            result = await self.__session.execute(
                select(Post)
                .where(Post.post_id == post_data.post_id)
                .options(selectinload(Post.replies))
            )
            return result.scalar()

    @postgres_exception_handler(action="Get action")
    async def get_actions(self, user_id: str, post_id: str, action_type: ActionType) -> List[PostActions]:
        """Return **list** of actions ordered by date in descending order. Even if you specified `action_type` as single action"""
        result = await self.__session.execute(
            select(PostActions)
            .where(and_(PostActions.owner_id == user_id, PostActions.action == action_type, PostActions.post_id == post_id))
            .order_by(PostActions.date.desc())
        )
        return result.scalars().all()

    @postgres_exception_handler(action="Get actions on post by specified type")
    async def get_post_action_by_type(self, post_id: str, action_type: ActionType) -> List[PostActions]:
        result = await self.__session.execute(
            select(PostActions)
            .where(and_(PostActions.post_id == post_id, PostActions.action == action_type))
            .order_by(PostActions.date.desc())
        )
        return result.scalars().all()
    
    @postgres_exception_handler(action="Get user actions by type")
    async def get_user_actions(self, user_id: str, action_type: ActionType, n_most_fresh: int | None, return_posts: bool = False) -> List[PostActions] | List[Post]:
        result = await self.__session.execute(
            select(PostActions)
            .where(and_(PostActions.owner_id == user_id, PostActions.action == action_type))
            .order_by(PostActions.date.desc())
            .limit(n_most_fresh) # limit an integer LIMIT parameter, or a SQL expression that provides an integer result. Pass None to reset it.
        )
        actions = result.scalars().all()

        if return_posts: return [action.post for action in actions]
        else: return actions

    @postgres_exception_handler(action="Get post replies")
    async def get_post_replies(self, post_id: str, page: int, n: int) -> List[Post]:
        likes_subq = (
            select(func.count(PostActions.action_id))
            .where(and_(PostActions.post_id == post_id, PostActions.action == "like"))
            .scalar_subquery()
        )
        result = await self.__session.execute(
            select(Post, likes_subq)
            .where(Post.parent_post_id == post_id)
            .order_by(Post.published.desc(), Post.popularity_rate.desc(), likes_subq.desc())
            .options(selectinload(Post.parent_post))
            .offset(page*n)
            .limit(n)
        )
        return result.scalars().all()
    
    @postgres_exception_handler(action="Get user's posts")
    async def get_user_posts(self, user_id: str, page: int, n: int, order: PostsOrderType) -> List[Post]:
        order_by_statement = self.define_posts_order_by(order=order)

        result = await self.__session.execute(
            select(Post)
            .where(and_(Post.owner_id == user_id, Post.is_reply == False))
            .limit(LOAD_MAX_USERS_POST)
            .order_by(order_by_statement)
            .options(selectinload(Post.parent_post))
            .offset(page*n)
            .limit(n)
        )
        return result.scalars().all()

    @postgres_exception_handler(action="Get user's replies")
    async def get_user_replies(self, user_id: str, page: int, n: int, order: PostsOrderType) -> List[Post]:
        order_by_statement = self.define_posts_order_by(order=order)

        result = await self.__session.execute(
            select(Post)
            .where(and_(Post.owner_id == user_id, Post.is_reply == True))
            .limit(LOAD_MAX_USERS_POST)
            .order_by(order_by_statement)
            .options(selectinload(Post.parent_post))
            .offset(page*n)
            .limit(n)
        )
        return result.scalars().all()
    
    @postgres_exception_handler(action="Get user's liked posts")
    async def get_user_liked_posts(self, user_id: str, page: int, n: int, order: PostsOrderType) -> List[Post]:
        order_by_statement = self.define_posts_order_by(order=order)

        actions_select = await self.__session.execute(
            select(PostActions)
            .where(and_(PostActions.owner_id == user_id, PostActions.action == ActionType.like))
            .offset(page*n)
            .limit(n)
        )

        liked_ids = set(action.post_id for action in actions_select.scalars().all())

        result = await self.__session.execute(
            select(Post)
            .where(Post.post_id.in_(liked_ids))
            .options(selectinload(Post.parent_post))
            .order_by(order_by_statement)
            .offset(page*n)
            .limit(n)
        )

        return result.scalars().all()

    @postgres_exception_handler(action="Get chat room by it's id")
    async def get_chat_room(self, room_id: str) -> ChatRoom | None:
        result = await self.__session.execute(
            select(ChatRoom)
            .where(ChatRoom.room_id == room_id)
        )
        return result.scalar()
    
    @postgres_exception_handler(action="Get chat last message`")
    async def get_chat_last_message(self, room_id: str) -> Message | None:
        result = await self.__session.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.sent.desc())
            .limit(1)
        )

        return result.scalar()

    @postgres_exception_handler(action="Get dialogue chat by two users")
    async def get_dialogue_by_users(self, user_1: User, user_2: User) -> ChatRoom | None:
        result = await self.__session.execute(
            select(ChatRoom)
            .where(and_(ChatRoom.is_group == False, ChatRoom.participants.contains(user_1), ChatRoom.participants.contains(user_2)))
        )
        return result.scalar()

    @postgres_exception_handler(action="Get n chat room messages excluding exclude_ids list")
    async def get_chat_n_fresh_chat_messages(self, room_id: str, page: int,  n: int = int(getenv("MESSAGES_BATCH_SIZE", "50")), pagination_normalization: int = 0) -> List[Message]:
        result = await self.__session.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.sent.desc())
            .offset((page*n) + pagination_normalization)
            .limit(n)
        )
        return result.scalars().all()
    
    @postgres_exception_handler(action="Get n user chat rooms excluding exclude_ids list")
    async def get_n_user_chats(self, user: User, n: int, page: int, approved: bool) -> List[ChatRoom]:
        where_stmt = ChatRoom.approved.is_(approved)

        result = await self.__session.execute(
            select(ChatRoom)
            .where(and_(ChatRoom.participants.contains(user), where_stmt))
            .order_by(ChatRoom.last_message_time.desc())
            .offset(page*n)
            .limit(n)
        )

        return result.scalars().all() 

    @postgres_exception_handler(action="Get message by it's id")
    async def get_message_by_id(self, message_id: str) -> Message | None:
        result = await self.__session.execute(
            select(Message)
            .where(Message.message_id == message_id)
        )

        return result.scalar()
    
    @postgres_exception_handler(action="Get chats last message")
    async def get_chats_last_message(self, room_ids: List[str]) -> dict[str, Message]:
        result = await self.__session.execute(
            select(Message)
            .distinct(Message.room_id)
            .where(Message.room_id.in_(room_ids))
            # The DISTINCT ON expression must always match the leftmost expression in the ORDER BY clause to ensure predictable results.
            # See: https://www.geeksforgeeks.org/postgresql/postgresql-distinct-on-expression/
            .order_by(Message.room_id, Message.sent.desc())
        )

        ready_messages = result.scalars().all()
        
        return { message.room_id: message for message in ready_messages }

    @postgres_exception_handler(action="Get all user chats")
    async def get_user_chats(self, user: User, approved: bool) -> ChatRoom:
        result = await self.__session.execute(
            select(ChatRoom)
            .where(and_(ChatRoom.participants.contains(user), ChatRoom.approved == approved))
        )

        return result.scalars().all()

    @postgres_exception_handler(action="Get most fresh followed posts")
    async def get_fresh_followed_posts(self, user: User, n: int) -> List[Post]:
        result = await  self.__session.execute(
            select(Post)
            .where(Post.owner.in_((user.followed)))
            .order_by(Post.published.desc())
            .limit(n)
        )

        return result.scalars().all()

    @postgres_exception_handler(action="Get most fresh action for a user")
    async def get_fresh_actions_for_user(self, user: User, n: int) -> List[PostActions]:
        result = await  self.__session.execute(
            select(PostActions)
            .where(PostActions.post.in_(user.posts))
            .order_by(PostActions.date.desc())
            .limit(n)
        )

        return result.scalars().all()

    @postgres_exception_handler(action="Check if user is following another user")
    async def check_follow(self, user: User, other_user_id: str) -> bool:
        result = await self.__session.execute(
            select(User)
            .where(and_(User.user_id == other_user_id, User.followers.contains(user)))
        )
        possible_folower = result.scalar()

        return possible_folower is not None