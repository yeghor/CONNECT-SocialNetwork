import React, { useState, useEffect, useRef } from "react";
import MessagesList from "../chatComponents/messagesList.tsx";
import MessageBar from "../chatComponents/messageBar.tsx";

import { connectWSChat,
    sendMessage, changeMessage, deleteMessage,
    checkWSConnEstablished,
    WebsocketNotReady,
    WebsocketConnectionError
 } from "../../../../fetching/chatWS.ts";
import {ChatConnectData, ChatMessage} from "../../../../fetching/responseDTOs.ts";
import LocalMessagesList from "../chatComponents/localMessagesList.tsx";
import message from "../chatComponents/message.tsx";
import {useNavigate} from "react-router";
import {chatsURI, internalServerErrorURI} from "../../../../consts.ts";

interface ActiveChatProps {
    activeChatData: ChatConnectData,
    chatId: string
}

const catchFailedRetriedConnection = (ws: WebSocket, setErrorMessage: CallableFunction) => {
    try {
        checkWSConnEstablished(ws);
    } catch (err) {
        if (err instanceof WebsocketNotReady) {
            setTimeout(() => catchFailedRetriedConnection(ws, setErrorMessage), 200);
        } else if (err instanceof WebsocketConnectionError) {
            console.error(err);
            setErrorMessage("Failed WebSocket connection!");
        }
    }
}

const ActiveChat = (props: ActiveChatProps) => {
    const navigate = useNavigate();

    const [ localMessages, setLocalMessages ] = useState<ChatMessage[]>([]);
    const [ retryToggler, setRetryToggler ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        const wsocket = connectWSChat(props.activeChatData.token)
        socket.current = wsocket;

        catchFailedRetriedConnection(socket.current, setErrorMessage);

        try {
            checkWSConnEstablished(socket.current)
        } catch (err) {
            if (err instanceof WebsocketConnectionError) {
                socket.current.close()
                socket.current = connectWSChat(props.activeChatData.token)
                catchFailedRetriedConnection(socket.current, setErrorMessage);
            }
        }

        const receiveWebsocketMessageListener = (event: MessageEvent) => {
            receiveWebsocketMessage(wsocket, event.data);
        }

        const websocketCloseEventListener = () => {
            navigate(chatsURI);
            window.alert("Connection unexpectedly closed");
        }

        socket.current.addEventListener("message", receiveWebsocketMessageListener);
        socket.current.addEventListener("close", websocketCloseEventListener);

        return () => {
            console.log("CLOSING CONNECTION")
            wsocket.close();
            wsocket.removeEventListener("message", receiveWebsocketMessageListener);
            wsocket.removeEventListener("close", websocketCloseEventListener);
        }

    }, [retryToggler])

    const getSocket = (): WebSocket => {
        if (!socket.current) {
            throw new WebsocketNotReady("Connection not ready yet.");
        }
        return socket.current;
    }

    const sendMessageWrapper = (message: string) => {
        const socket = getSocket();
        try {
            checkWSConnEstablished(socket);
            sendMessage(socket, message);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => sendMessageWrapper(message), 200);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const changeMessageWrapper = (message: string, messageId: string, local: boolean) => {
        const socket = getSocket();
        try {
            checkWSConnEstablished(socket);
            changeMessage(socket, message, messageId)
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => changeMessageWrapper(message, messageId, local), 200);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const deleteMessageWrapper = (messageId: string, local: boolean) => {
        const socket = getSocket();
        try {
            checkWSConnEstablished(socket);
            deleteMessage(socket, messageId);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => deleteMessageWrapper(messageId, local), 200);
                return;
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
                return;
            }
        }
    };

    const deleteMessageHistory = (messageId: string) => deleteMessageWrapper(messageId, false);
    const changeMessageHistory = (message: string, messageId: string) => changeMessageWrapper(message, messageId, false)

    const deleteMessageLocal = (messageId: string) => deleteMessageWrapper(messageId, true);
    const changeMessageLocal = (message: string, messageId: string) => changeMessageWrapper(message, messageId, true);

    const receiveWebsocketMessage = (websocket: WebSocket, message: MessageEvent) => {
        console.log("Received Websocket message", websocket);
    }

    return(
        <div>
            <MessagesList chatId={props.chatId} changeMessageCallable={changeMessageHistory} deleteMessageCallable={deleteMessageHistory} />
            <LocalMessagesList messagesData={localMessages} changeMessageFunc={changeMessageLocal} deleteMessageFunc={deleteMessageLocal} />
            <MessageBar sendMessageCallable={sendMessageWrapper} />
        </div>
    );
};

export default ActiveChat;