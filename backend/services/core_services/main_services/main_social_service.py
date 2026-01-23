import asyncio

from services.core_services import MainServiceBase
from services.postgres_service.models import *
from post_popularity_rate_task.popularity_rate import POST_ACTIONS
from mix_posts_consts import *
from project_types import PostsOrderType, PostsType

from dotenv import load_dotenv
from datetime import datetime
from os import getenv
from typing import List, TypeVar, Type, Literal, Iterable, NamedTuple, Union, Dict
from pydantic_schemas.pydantic_schemas_social import *

from exceptions.exceptions_handler import web_exceptions_raiser
from exceptions.custom_exceptions import *

load_dotenv()

HISTORY_POSTS_TO_TAKE_INTO_RELATED = int(getenv("HISTORY_POSTS_TO_TAKE_INTO_RELATED", 30))
LIKED_POSTS_TO_TAKE_INTO_RELATED = int(getenv("LIKED_POSTS_TO_TAKE_INTO_RELATED", 10))
REPLY_COST_DEVALUATION = float(getenv("REPLY_COST_DEVALUATION")) # TODO: Devaluate multiple replies cost. To prevent popularity rate abuse
FEED_MAX_POSTS_LOAD = int(getenv("FEED_MAX_POSTS_LOAD"))
MINIMUM_USER_HISTORY_LENGTH = int(getenv("MINIMUM_USER_HISTORY_LENGTH"))

RECENT_ACTIVITY_ENTRIES = int(getenv("RECENT_ACTIVITY_ENTRIES"))

SHUFFLE_BY_RATE = float(getenv("SHUFFLE_BY_RATE", "0.7"))
SHUFFLE_BY_TIMESTAMP = float(getenv("SHUFFLE_BY_TIMESTAMP", "0.3"))

REPLY_COST_DEVALUATION = float(getenv("REPLY_COST_DEVALUATION", "0.5"))
MAX_REPLIES_THAT_GIVE_POPULARITY_RATE = int(getenv("MAX_REPLIES_THAT_GIVE_POPULARITY_RATE", "3"))

BASE_PAGINATION = int(getenv("BASE_PAGINATION"))
DIVIDE_BASE_PAG_BY = int(getenv("DIVIDE_BASE_PAG_BY"))
SMALL_PAGINATION = int(getenv("SMALL_PAGINATION"))

M = TypeVar("M", bound=Base)

CoroutineFunc = TypeVar("CoroutineFunc")
ListData = TypeVar("ContainsType")

class IdsPostTuple(NamedTuple):
    ids: List[str]
    posts: List[Post]


class MainServiceSocial(MainServiceBase):
    @staticmethod
    def change_post_rate(post: Post, action_type: ActionType | None, add: bool,  cost: int | None = None) -> None:
        """Set add to True to add rate, False to subtrack \n If you want to increase rate by specific rate - provide cost"""
        if not cost:
            cost = POST_ACTIONS[action_type.value]

        if add: post.popularity_rate += cost
        else: post.popularity_rate -= cost

    @staticmethod
    def combine_lists(*lists: Iterable) -> List:
        to_return = []
        
        for lst in lists:
            to_return.extend(lst)

        return to_return

    @staticmethod
    def _shuffle_posts(posts: List[Post]) -> List[Post]:
        now = datetime.now().timestamp()
        return sorted(
            posts,
            key=lambda post: (
                post.popularity_rate * SHUFFLE_BY_RATE,
                # minus is required, because we want to show more young posts
                -(now - post.published.timestamp() * SHUFFLE_BY_TIMESTAMP)
            ),
            reverse=True
        )

    @staticmethod
    def check_post_user_id(post: Post, user: User) -> None:
        """If ids doesn't match - raises HTTPException 401"""
        if post.owner_id != user.user_id:
            raise Unauthorized(detail=f"SocialService: User: {user.user_id} tried to access post: {post.post_id}", client_safe_detail="You are not owner of this post!")

    async def _get_ids_by_query_type(self, page: int, user: User, n: int, id_type: Literal["followed", "fresh"], return_posts_too: bool = False, exclude_ids: List[str] = []) -> Union[List[str], NamedTuple]:
        if id_type == "fresh": posts = await self._PostgresService.get_fresh_posts(user=user, exclude_ids=exclude_ids, n=n, page=page)
        elif id_type == "followed": posts = await self._PostgresService.get_followed_posts(user=user, exclude_ids=exclude_ids, n=n, page=page)

        ids = [post.post_id for post in posts]

        if return_posts_too: return (ids, posts)
        else: return ids
        
    async def _construct_and_flush_action(self, action_type: ActionType, user: User, post: Post = None) -> bool:
        """Returns `True` if action registered, otherwise `False`"""
        actions = await self._PostgresService.get_actions(user_id=user.user_id, post_id=post.post_id, action_type=action_type)
        cost = POST_ACTIONS[action_type.value]

        if actions:
            if action_type == ActionType.view:
                if not await self._RedisService.check_view_timeout(id_=post.post_id, user_id=user.user_id):
                    return False
            elif action_type == ActionType.reply:
                if len(actions) < MAX_REPLIES_THAT_GIVE_POPULARITY_RATE:
                    cost = POST_ACTIONS[action_type.value]
                    for _ in range(len(actions)): cost *= REPLY_COST_DEVALUATION
                else: cost = 0
            else:
                raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to give already given action: {action_type.value} to post: {post.post_id} that does not exists.", client_safe_detail="This action is already given to this post.")

        if action_type == ActionType.view:
            await self._RedisService.add_view(user_id=user.user_id, id_=post.post_id)

        self.change_post_rate(post=post, action_type=action_type, cost=cost, add=True)

        action = PostActions(
            action_id=str(uuid4()),
            owner_id=user.user_id,
            post_id=post.post_id,
            action=action_type,
        )

        await self._PostgresService.insert_models_and_flush(action)

        return True

    @web_exceptions_raiser
    async def sync_postgres_chroma_DEV_METHOD(self) -> None:
        # TEMPORARY! Not the actual MainSocialService method
        await self._ChromaService.drop_all()
        posts = await self._PostgresService.get_all_from_model(ModelType=Post)
        await self._ChromaService.add_posts_data(posts=posts)

    @web_exceptions_raiser
    async def _get_all_from_specific_model(self, ModelType: Type[M]) -> List[M]:
        return await self._PostgresService.get_all_from_model(ModelType=ModelType)

    @web_exceptions_raiser
    async def get_feed(self, user: User, page: int) -> List[PostLiteSchema]:
        """`
        Returns related posts to provided User table object view history \n
        It mixes history rated with most popular posts, and newest ones.
        """

        # TODO: KISS THIS MOTHERFUCKER

        EACH_SOURCE_PAGINATION = int(BASE_PAGINATION / DIVIDE_BASE_PAG_BY)


        views_history = await self._PostgresService.get_user_actions(user_id=user.user_id, action_type=ActionType.view, n_most_fresh=HISTORY_POSTS_TO_TAKE_INTO_RELATED, return_posts=True)
        liked_history = await self._PostgresService.get_user_actions(user_id=user.user_id, action_type=ActionType.like, n_most_fresh=LIKED_POSTS_TO_TAKE_INTO_RELATED, return_posts=True)
        history_posts_relation = views_history + liked_history

        # History related mix
        if len(views_history) > MINIMUM_USER_HISTORY_LENGTH and len(liked_history) > MINIMUM_USER_HISTORY_LENGTH:
            related_ids = await self._ChromaService.get_n_related_posts_ids(user=user, page=page, post_relation=history_posts_relation, pagination=EACH_SOURCE_PAGINATION)

            # Following mix
            followed_ids =  await self._get_ids_by_query_type(exclude_ids=related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="followed")
            if not followed_ids:
                followed_ids = await self._get_ids_by_query_type(exclude_ids=related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="fresh")

            unrelevant_ids = await self._get_ids_by_query_type(exclude_ids=followed_ids + related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="fresh")
            
        else:
            related_ids = await self._get_ids_by_query_type(page=page, user=user, n=EACH_SOURCE_PAGINATION, id_type="fresh")

            # Following mix
            followed_ids =  await self._get_ids_by_query_type(exclude_ids=related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="followed")


            if not followed_ids:
                followed_ids = await self._get_ids_by_query_type(exclude_ids=related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="fresh")
                unrelevant_ids = await self._get_ids_by_query_type(exclude_ids=followed_ids + related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="fresh")
            else:
                unrelevant_ids = await self._get_ids_by_query_type(exclude_ids=followed_ids + related_ids, user=user, page=page, n=EACH_SOURCE_PAGINATION, id_type="fresh")


        all_ids = self.combine_lists(related_ids, followed_ids, unrelevant_ids)

        posts = await self._PostgresService.get_entries_by_ids(ids=all_ids, ModelType=Post)
        posts = set(self._shuffle_posts(posts=posts))

        return [
            PostLiteSchema(
                post_id=post.post_id,
                title=post.title,
                published=post.published,
                is_reply=post.is_reply,
                likes=post.likes_count,
                views=post.views_count,
                is_my_post=user.user_id == post.owner_id,
                replies=post.replies_count,
                owner=UserShortSchemaAvatarURL(user_id=post.owner_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner_id)),
                pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.images]),
                parent_post=PostBase(
                    post_id=post.parent_post.post_id,
                    title=post.parent_post.title,
                    published=post.parent_post.published,
                    is_reply=post.parent_post.is_reply ,
                    owner=UserShortSchemaAvatarURL(user_id=post.parent_post.owner_id, username=post.parent_post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.parent_post.owner_id)),
                    likes=post.parent_post.likes_count,
                    views=post.parent_post.views_count,
                    replies=post.parent_post.replies_count,
                    is_my_post=user.user_id == post.parent_post.owner_id,
                    pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.parent_post.images])
                ) if post.parent_post else None
            ) for post in posts
            ]

    @web_exceptions_raiser
    async def get_followed_posts(self, user: User, page: int) -> List[PostLiteSchema]:        
        post_ids, posts = await self._get_ids_by_query_type(page=page, n=BASE_PAGINATION, user=user, id_type="followed", return_posts_too=True)

        posts = self._shuffle_posts(posts=posts)

        return [
            PostLiteSchema(
                post_id=post.post_id,
                title=post.title,
                published=post.published,
                is_reply=post.is_reply,
                owner=UserShortSchemaAvatarURL(user_id=post.owner_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner_id)),
                likes=post.likes_count,
                views=post.views_count,
                is_my_post=user.user_id == post.owner_id,
                replies=post.replies_count,
                pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.images]),
                parent_post=PostBase(
                    post_id=post.parent_post.post_id,
                    title=post.parent_post.title,
                    published=post.parent_post.published,
                    is_reply=post.parent_post.is_reply ,
                    owner=UserShortSchemaAvatarURL(user_id=post.parent_post.owner_id, username=post.parent_post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.parent_post.owner_id)),
                    likes=post.parent_post.likes_count,
                    views=post.parent_post.views_count,
                    replies=post.parent_post.replies_count,
                    is_my_post=user.user_id == post.parent_post.owner_id,
                    pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.parent_post.images])
                ) if post.parent_post else None
            ) for post in posts
            ]
    
    @web_exceptions_raiser
    async def search_posts(self, prompt: str, user: User, page: int) -> List[PostLiteSchema]:
        """
        Search posts that similar with meaning to prompt
        """

        post_ids = await self._ChromaService.search_posts_by_prompt(prompt=prompt, page=page, n=BASE_PAGINATION)
        posts = await self._PostgresService.get_entries_by_ids(ids=post_ids, ModelType=Post)

        return [
            PostLiteSchema(
                post_id=post.post_id,
                title=post.title,
                published=post.published,
                is_reply=post.is_reply,
                likes=post.likes_count,
                views=post.views_count,
                replies=post.replies_count,
                is_my_post=user.user_id == post.post_id,          
                owner=UserShortSchemaAvatarURL(user_id=post.owner_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner_id)),
                pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.images]),
                parent_post=PostBase(
                    post_id=post.parent_post.post_id,
                    title=post.parent_post.title,
                    published=post.parent_post.published,
                    is_reply=post.parent_post.is_reply ,
                    owner=UserShortSchemaAvatarURL(user_id=post.parent_post.owner_id, username=post.parent_post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.parent_post.owner_id)),
                    likes=post.parent_post.likes_count,
                    views=post.parent_post.views_count,
                    replies=post.parent_post.replies_count,
                    is_my_post=user.user_id == post.parent_post.post_id,
                    pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.parent_post.images])
                ) if post.parent_post else None
            ) for post in posts
            ]

    @web_exceptions_raiser
    async def search_users(self, prompt: str,  request_user: User, page: int) -> List[UserLiteSchema]:
        users = await self._PostgresService.get_users_by_username(prompt=prompt, page=page, n=BASE_PAGINATION)
        return [UserLiteSchema(user_id=user.user_id, username=user.username, followers=len(user.followers), joined=user.joined, avatar_url=await self._ImageStorage.get_user_avatar_url(user.user_id)) for user in users]

    @web_exceptions_raiser  
    async def make_post(self, data: MakePostDataSchema, user: User) -> PostBaseShort:
        if data.parent_post_id:
            parent_post = await self._PostgresService.get_entry_by_id(id_=data.parent_post_id, ModelType=Post)
            parent_post.replies_count += 1
            if not parent_post:
                raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to reply to post: {data.parent_post_id} that does not exists.", client_safe_detail="Post that you are replying does not exist.")

        post = Post(
            post_id=str(uuid4()),
            owner_id=user.user_id,
            parent_post_id=data.parent_post_id,
            title=data.title,
            text=data.text,
            is_reply=bool(data.parent_post_id)
        )

        await self._PostgresService.insert_models_and_flush(post)
        await self._PostgresService.refresh_model(post)
        await self._ChromaService.add_posts_data(posts=[post])

        return PostBaseShort.model_validate(post, from_attributes=True)

    @web_exceptions_raiser
    async def remove_action(self, user: User, post: Post, action_type: ActionType) -> None:
        if action_type.value == "reply":
            raise InvalidAction()

        potential_action = await self._PostgresService.get_actions(user_id=user.user_id, post_id=post.post_id, action_type=action_type)
        if not potential_action:
            raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to remove post action: {post.post_id} that does not exists.")

        if len(potential_action) > 1:
            raise WrongDataFound(detail=f"SocialService: User: {user.user_id} tried to remove post action, but multiple instances of action", client_safe_detail="Something wrong happened on our side, please, contact us.")

        await self._PostgresService.delete_models_and_flush(potential_action[0])
        self.change_post_rate(post=post, action_type=action_type, add=False)
    
    @web_exceptions_raiser
    async def delete_post(self, post_id: str, user: User) -> None:
        post = await self._PostgresService.get_entry_by_id(id_=post_id, ModelType=Post)

        if not post:
            raise ResourceNotFound(detail=f"SocialService: User: {user.user_id} tried to delete post: {post_id} that does not exist.", client_safe_detail="Post that you trying to delete does not exist.")

        self.check_post_user_id(post=post, user=user)

        if post.parent_post:
            post.parent_post.replies_count -= 1

        await self._PostgresService.delete_post_by_id(id_=post.post_id)
        await self._ImageStorage.delete_post_images(base_name=post.post_id)
        await self._ChromaService.delete_by_ids(ids=[post.post_id])

    @web_exceptions_raiser
    async def like_post_action(self, post_id: str, user: User, like: bool = True) -> None:
        """Set 'like' param to True to leave like. To remove like - set to False"""
        post = await self._PostgresService.get_entry_by_id(id_=post_id, ModelType=Post)
        if like:
            await self._construct_and_flush_action(action_type=ActionType.like,post=post, user=user)
            post.likes_count += 1
        else:
            await self.remove_action(user=user, post=post, action_type=ActionType.like)
            post.likes_count -= 1

    @web_exceptions_raiser
    async def change_post(self, post_data: PostDataSchemaID, user: User, post_id: str) -> PostSchema:
        post = await self._PostgresService.get_entry_by_id(id_=post_id, ModelType=Post)

        if not post:
            raise ResourceNotFound(detail=f"SocialService: User: {user.user_id} tried to change post: {post_id} that does not exist.", client_safe_detail="Post that you trying to change does not exist.")

        self.check_post_user_id(post=post, user=user)
        
        updated_post = await self._PostgresService.update_post_fields(post_data=post_data, post_id=post_id, return_updated_post = True)
        await self._ChromaService.add_posts_data(posts=[updated_post])

        return PostSchema.model_validate(updated_post, from_attributes=True)

    @web_exceptions_raiser
    async def friendship_action(self, user: User, other_user_id: str, follow: bool) -> None:
        """To follow user - set follow to True. To unfollow - False"""

        if user.user_id == other_user_id:
            raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to follow himself.", client_safe_detail="You can't follow yourself.")

        other_user = await self._PostgresService.get_entry_by_id(id_=other_user_id, ModelType=User)
        
        # Getting fresh user. Because merged Model often lose it's relationships loads
        fresh_user = await self._PostgresService.get_entry_by_id(id_=user.user_id, ModelType=User)

        if follow:
            if other_user in fresh_user.followed:
                raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to follow user: {other_user.user_id} already following him", client_safe_detail="You are already following this user. You can't follow him")
            fresh_user.followed.append(other_user)
        elif not follow:
            if other_user not in fresh_user.followed:
                raise InvalidAction(detail=f"SocialService: User: {user.user_id} tried to unfollow user: {other_user.user_id} not following him", client_safe_detail="You are not following this user. You can't unfollow him")
            fresh_user.followed.remove(other_user)
    
    @web_exceptions_raiser
    async def get_user_profile(self, user: User, other_user_id: str) -> UserSchema:
        other_user = await self._PostgresService.get_entry_by_id(id_=other_user_id, ModelType=User)

        if not other_user: 
            raise ResourceNotFound(detail=f"User: {user.user_id} tried to get user: {other_user_id} profile that does not exist.", client_safe_detail="User profile that you trying to get does not exist.")

        avatar_token = await self._ImageStorage.get_user_avatar_url(image_name=other_user.user_id)

        return UserSchema(
            user_id=other_user.user_id,
            username=other_user.username,
            followers=len(other_user.followers),
            followed=len(other_user.followed),
            avatar_url=avatar_token,
            joined=other_user.joined,
            me=True if user.user_id == other_user_id else False,
            is_following=await self._PostgresService.check_follow(user=user, other_user_id=other_user_id)
        )
    
    @web_exceptions_raiser
    async def get_user_posts(self, sender_id: str, user_id: str, page: int, order: PostsOrderType, posts_type: PostsType) -> List[PostLiteSchema]:
        posts = []

        arguments = {"user_id": user_id, "page": page, "n": SMALL_PAGINATION, "order": order}

        match posts_type:
            case "posts":
                posts = await self._PostgresService.get_user_posts(**arguments)
            case "replies":
                posts = await self._PostgresService.get_user_replies(**arguments)
            case "likes":
                posts = await self._PostgresService.get_user_liked_posts(**arguments)

        return [
            PostLiteSchema(
                post_id=post.post_id,
                title=post.title,
                published=post.published,
                is_reply=post.is_reply,
                owner=UserShortSchemaAvatarURL(user_id=post.owner.user_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner.user_id)),
                is_my_post=post.owner_id == sender_id,
                likes=post.likes_count,
                views=post.views_count,
                replies=post.replies_count,
                pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.images]),
                parent_post=PostBase(
                    post_id=post.parent_post.post_id,
                    title=post.parent_post.title,
                    published=post.parent_post.published,
                    is_reply=post.parent_post.is_reply ,
                    owner=UserShortSchemaAvatarURL(user_id=post.parent_post.owner_id, username=post.parent_post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.parent_post.owner_id)),
                    likes=post.parent_post.likes_count,
                    views=post.parent_post.views_count,
                    replies=post.parent_post.replies_count,
                    is_my_post=post.owner_id == sender_id,
                    pictures_urls= await self._ImageStorage.get_post_image_urls(images_names=[post_image.image_name for post_image in post.parent_post.images])
                ) if post.parent_post else None
            ) for post in posts
        ]
    
    @web_exceptions_raiser
    async def get_my_profile(self, user: User) -> UserSchema:
        """To use this method you firstly need to get User instance by Bearer token"""

        # To prevent SQLAlchemy missing greenlet_spawn error. Cause merged_model method can cause loss of self-referential relationships
        user = await self._PostgresService.get_entry_by_id(id_=user.user_id, ModelType=User)

        avatar_token = await self._ImageStorage.get_user_avatar_url(image_name=user.user_id)

        return UserSchema(
            user_id=user.user_id,
            username=user.username,
            followers=len(user.followers),
            followed=len(user.followed),
            posts=user.posts,
            avatar_url=avatar_token,
            joined=user.joined,
            is_following=False,
            me=True
        )

    @web_exceptions_raiser
    async def load_post(self, user: User, post_id: str) -> PostSchema:
        post = await self._PostgresService.get_entry_by_id(id_=post_id, ModelType=Post)

        if not post:
            raise ResourceNotFound(detail=f"SocialService: User: {user.user_id} tried to load post: {post_id} that does not exist.", client_safe_detail="This post does not exist.")

        registered_view = await self._construct_and_flush_action(action_type=ActionType.view, post=post, user=user)

        if registered_view: post.views_count += 1

        liked = await self._PostgresService.get_actions(user.user_id, post_id=post_id, action_type=ActionType.like)

        filenames = [filename.image_name for filename in post.images]
        images_temp_urls = await self._ImageStorage.get_post_image_urls(images_names=filenames)

        return PostSchema(
            post_id=post.post_id,
            title=post.title,
            text=post.text,
            published=post.published,
            owner=UserShortSchemaAvatarURL(user_id=post.owner_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner_id)),
            likes=post.likes_count,
            is_liked=True if liked else False,
            views=post.views_count,
            replies=post.replies_count,
            is_my_post=user.user_id == post.owner_id,
            parent_post=PostBase(
                post_id=post.parent_post.post_id,
                title=post.parent_post.title,
                published=post.parent_post.published,
                is_reply=post.parent_post.is_reply,
                owner=UserShortSchemaAvatarURL(user_id=post.parent_post.owner_id, username=post.parent_post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.parent_post.owner_id)),
                likes=post.parent_post.likes_count,
                views=post.parent_post.views_count,
                replies=post.parent_post.replies_count,
                is_my_post=user.user_id == post.parent_post.owner_id
            ) if post.parent_post else None,
            last_updated=post.last_updated,
            pictures_urls=images_temp_urls,
            is_reply=post.is_reply
        )

    async def _create_post_lite_schema_via_gather(self, user_id: str, post: Post) -> PostBase:
        images_coroutines = [self._ImageStorage.get_post_image_urls(images_names=image.image_name) for image in post.images]

        images_urls = (await asyncio.gather(*images_coroutines))

        if not images_urls:
            images_urls = []
        else:
            images_urls = images_urls[0]

        return PostBase(
            post_id=post.post_id,
            title=post.title,
            published=post.published,
            is_my_post=post.owner_id == user_id,
            is_reply=post.is_reply,
            pictures_urls=images_urls,
            owner=UserShortSchemaAvatarURL(user_id=post.owner_id, username=post.owner.username, avatar_url=await self._ImageStorage.get_user_avatar_url(post.owner_id)),
        )

    @web_exceptions_raiser
    async def load_replies(self, user_id: str, post_id: str, page: int) -> List[PostBase]:
        replies = await self._PostgresService.get_post_replies(post_id=post_id, page=page, n=SMALL_PAGINATION)

        replies_coroutines = [self._create_post_lite_schema_via_gather(user_id=user_id, post=reply) for reply in replies]

        return await asyncio.gather(*replies_coroutines)

    async def _get_recent_action_message(self, action: PostActions) -> Dict | None:
        """
        Returns dict that compatible to Pydantic **RecentActivitySchema** model
        """

        match action.action.value:
            case "like":
                return {
                    "avatar_url": await self._ImageStorage.get_user_avatar_url(action.owner.username),
                    "message": f"{action.owner.username} liked your post",
                    "date": action.date
                }
            case "reply":
                return  {
                    "avatar_url": await self._ImageStorage.get_user_avatar_url(action.owner.username),
                    "message": f"{action.owner.username} left a reply to your post: {action.post.title}",
                    "date": action.date
                }

    async def _get_recent_followed_post_message(self, followed_post: Post) -> Dict | None:
        """
        Returns dict that compatible to Pydantic RecentActivitySchema model
        Use with function that is wrapper with `@web_exceptions_raiser`
        """

        return {
            "avatar_url": await self._ImageStorage.get_user_avatar_url(followed_post.owner.username),
            "message": f"{followed_post.owner.username} made a new post.",
            "date": followed_post.published
        }

    @web_exceptions_raiser
    async def get_recent_activity(self, user: User) -> List[RecentActivitySchema]:
        followed_posts = await self._PostgresService.get_fresh_followed_posts(user)
        actions = await self._PostgresService.get_fresh_actions_for_user(user)

        followed_coroutines = [self._get_recent_followed_post_message(post) for post in followed_posts]
        action_coroutines = [self._get_recent_action_message(action) for action in actions]

        activity = await asyncio.gather(*followed_coroutines, *action_coroutines)
        activity = filter(lambda i: bool(i), activity)

        return sorted(activity, key=lambda message: message.get("date"), reverse=True)[:RECENT_ACTIVITY_ENTRIES]
    
    @web_exceptions_raiser
    async def get_my_friends(self, user: User) -> List[UserLiteSchema]:
        friends = await self._PostgresService.get_friendships(user=user)

        return [
            UserLiteSchema(
                user_id=user.user_id,
                username=user.username,
                avatar_url=await self._ImageStorage.get_user_avatar_url(user.image_path),
                joined=user.joined,
                followers=len(user.followers)
            ) for user in friends
        ]