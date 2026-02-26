from fastapi.websockets import WebSocket
from pydantic_schemas.pydantic_schemas_chat import (
    ExpectedWSData,
    ChatJWTPayload,
    ActionType,
    MessageSchemaActionIncluded,
    MessageSchemaShortActionIncluded,
)
from typing import List, Dict, Literal
from exceptions.custom_exceptions import NoActiveConnectionsOrRoomDoesNotExist

from services.redis_service import RedisService

from dotenv import load_dotenv

load_dotenv()


class WebsocketConnectionManager:
    _instance = None
    _initialized = False

    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_room_connections(self, room_id: str) -> List[Dict]:
        """Returns room connections or raise NoActiveConnectionsOrRoomDoesNotExist exception."""
        possible_conns = self._rooms.get(room_id)
        if not possible_conns:
            raise NoActiveConnectionsOrRoomDoesNotExist(
                f"WebSocketConnectionManager: User tried to get room: {room_id} but no active connections found"
            )
        return possible_conns

    def __init__(self, mode: Literal["prod", "test"] = "prod"):
        """
        This manager is only for **fast local** message update between connections.

        It's do **NOT** syncing with PostgreSQL

        Switch to mode='test' to connect to test Redis pool
        """
        self._redis: RedisService = RedisService(db_pool=mode)

        if self._initialized:
            return
        self._initialized = True

        self._rooms = {}

    async def execute_real_time_action(
        self,
        connection_data: ChatJWTPayload,
        db_message_data: MessageSchemaActionIncluded | MessageSchemaShortActionIncluded,
    ) -> None:
        if db_message_data.action == "send":
            await self._send_message(
                db_message_data=db_message_data,
                room_id=connection_data.room_id,
                sender_id=connection_data.user_id,
            )
        elif db_message_data.action == "change":
            await self._change_message(
                db_message_data=db_message_data,
                room_id=connection_data.room_id,
                sender_id=connection_data.user_id,
            )
        elif db_message_data.action == "delete":
            await self._delete_message(
                db_message_data=db_message_data,
                room_id=connection_data.room_id,
                sender_id=connection_data.user_id,
            )

    async def connect(self, room_id: str, user_id: str, websocket: WebSocket) -> None:
        payload = {"user_id": user_id, "websocket": websocket}

        if not room_id in self._rooms.keys():
            self._rooms[room_id] = [payload]
        else:
            # TODO: Optimize loops
            conn_exists = False
            for conn in self._rooms[room_id]:
                if user_id == conn["user_id"]:
                    conn_exists = True
                    break

            if conn_exists:
                for conn in self._rooms[room_id]:
                    if conn["user_id"] == user_id:
                        conn["websocket"] = websocket
            else:
                self._rooms[room_id].append(payload)

        await self._redis.connect_user_to_chat(user_id=user_id, room_id=room_id)

    async def disconnect(self, room_id: str, websocket: WebSocket) -> None:
        connections = self._get_room_connections(room_id=room_id)

        user_id = None
        for conn in connections:
            if conn["websocket"] == websocket:
                user_id = conn["user_id"]
                connections.remove(conn)
                break

        if user_id:
            await self._redis.disconect_from_chat(room_id=room_id, user_id=user_id)
            await self._redis.reset_user_chat_pagination(user_id=user_id)

    async def _send_message(
        self, db_message_data: MessageSchemaActionIncluded, room_id: str, sender_id: str
    ) -> None:
        """Distribute message to room and all online room members, including sender."""
        connections = self._get_room_connections(room_id=room_id)

        for conn in connections:
            websocket: WebSocket = conn["websocket"]
            await websocket.send_json(
                # Sending Python JSON serializable object. Not JSON string!
                db_message_data.model_dump(mode="json")
            )

    async def _delete_message(
        self, db_message_data: MessageSchemaActionIncluded, room_id: str, sender_id: str
    ) -> None:
        connections = self._get_room_connections(room_id=room_id)

        for conn in connections:
            if conn["user_id"] == sender_id:
                continue

            websocket: WebSocket = conn["websocket"]
            print(db_message_data)
            await websocket.send_json(
                # Sending Python JSON serializable object. Not JSON string!
                db_message_data.model_dump(mode="json")
            )

    async def _change_message(
        self, db_message_data: MessageSchemaActionIncluded, room_id: str, sender_id: str
    ) -> None:
        connections = self._get_room_connections(room_id=room_id)

        for conn in connections:
            if conn["user_id"] == sender_id:
                continue

            websocket: WebSocket = conn["websocket"]

            await websocket.send_json(
                # Sending Python JSON serializable object. Not JSON string!
                db_message_data.model_dump(mode="json")
            )
