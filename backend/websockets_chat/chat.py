from fastapi import WebSocket, APIRouter, Depends, Body
from authorization import authorize_private_endpoint, authorize_chat_token, JWTService
from services.postgres_service import User, get_session_depends, merge_model
from services.core_services.main_services import MainChatService
from services.core_services.core_services import MainServiceContextManager
from websockets_chat.connection_manager import WebsocketConnectionManager

from exceptions.exceptions_handler import (
    endpoint_exception_handler,
    ws_endpoint_exception_handler,
)

from pydantic_schemas.pydantic_schemas_chat import *
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from routes.query_utils import page_validator

chat = APIRouter()

connection = WebsocketConnectionManager()


@chat.get("/chat/connect/{chat_id}")
@endpoint_exception_handler
async def get_chat_connect_data(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> ChatConnect:
    """Can be used only with approved chats or groups"""
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_chat_token_including_participants_data(
            room_id=chat_id, user=user
        )


@chat.get("/chat/not-approved/connect/{chat_id}")
@endpoint_exception_handler
async def get_not_approved_chat_connect_data(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> NotApprovedChatData:
    """Can be used only with not approved dialogue chats"""
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_not_approved_chat_data(room_id=chat_id, user=user)


@chat.get("/chat/is-approved/{chat_id}")
@endpoint_exception_handler
async def get_chat_pending_state(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> bool:
    """Can be used only with not approved dialogue chats"""
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.check_chat_not_approved(room_id=chat_id, user=user)


@chat.get("/chat/{chat_id}/messages/{page}")
@endpoint_exception_handler
async def get_batch_of_chat_messages(
    chat_id: str,
    page: int = Depends(page_validator),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> List[MessageSchema]:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_chat_messages_batch(
            room_id=chat_id, user=user, page=page
        )


@chat.post("/chat/dialogue")
@endpoint_exception_handler
async def create_dialogue_chat(
    data: CreateDialogueRoomBody = Body(...),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> str:
    """Returns created chat id"""
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.create_dialogue_chat(data=data, user=user)


@chat.post("/chat/group")
@endpoint_exception_handler
async def create_group_chat(
    data: CreateGroupRoomBody,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> str:
    """Returns created group id"""
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.create_group_chat(data=data, user=user)


@chat.get("/chat/approved/{page}")
@endpoint_exception_handler
async def get_my_chats(
    page: int = Depends(page_validator),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> List[ChatSchema]:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_chat_batch(user=user, page=page, approved=True)


@chat.get("/chat/not-approved/{page}")
@endpoint_exception_handler
async def get_not_approved_chats(
    page: int = Depends(page_validator),
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> List[ChatSchema]:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_chat_batch(user=user, page=page, approved=False)


@chat.post("/chat/approve/{chat_id}")
@endpoint_exception_handler
async def approve_chat(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.approve_chat(room_id=chat_id, user=user)


@chat.get("/chat/id/{other_user_id}")
@endpoint_exception_handler
async def get_dialoque_id_by_other_user_id(
    other_user_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> str | None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_dialoque_id_by_other_user_id(
            other_user_id=other_user_id, user=user
        )


@chat.get("/chat/not-approved")
@endpoint_exception_handler
async def get_number_of_not_approved_chats(
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> int:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.get_number_of_not_approved_chats(user=user)


@chat.post("/chat/leave/{chat_id}")
@endpoint_exception_handler
async def leave_from_group(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> None:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.leave_from_group(user=user, room_id=chat_id)


@chat.get("/chat/not-approved/initiated-by-me/{chat_id}")
@endpoint_exception_handler
async def chat_initiated_by_me(
    chat_id: str,
    user_: User = Depends(authorize_private_endpoint),
    session: AsyncSession = Depends(get_session_depends),
) -> bool:
    user = await merge_model(postgres_session=session, model_obj=user_)
    async with await MainServiceContextManager[MainChatService].create(
        MainServiceType=MainChatService, postgres_session=session
    ) as chat_service:
        return await chat_service.initiated_by_me(user=user, room_id=chat_id)


async def wsconnect(token: str, websocket: WebSocket) -> ChatJWTPayload:
    connection_data = JWTService.extract_chat_jwt_payload(jwt_token=token)
    await connection.connect(
        room_id=connection_data.room_id,
        user_id=connection_data.user_id,
        websocket=websocket,
    )

    await websocket.accept()

    return connection_data


@chat.websocket("/{token}")
@ws_endpoint_exception_handler
async def connect_to_websocket_chat_room(
    websocket: WebSocket,
    token: str = Depends(authorize_chat_token),
    session: AsyncSession = Depends(get_session_depends),
):
    connection_data = await wsconnect(token=token, websocket=websocket)
    try:
        while True:
            json_dict = await websocket.receive_json()

            # If in json_dict enough data - it passes not related fields
            request_data = ExpectedWSData.model_validate(json_dict, strict=True)

            async with await MainServiceContextManager[MainChatService].create(
                MainServiceType=MainChatService, postgres_session=session
            ) as chat:
                db_message_data = await chat.execute_action(
                    request_data=request_data, connection_data=connection_data
                )

            await connection.execute_real_time_action(
                connection_data=connection_data, db_message_data=db_message_data
            )
    finally:
        await connection.disconnect(
            room_id=connection_data.room_id, websocket=websocket
        )
