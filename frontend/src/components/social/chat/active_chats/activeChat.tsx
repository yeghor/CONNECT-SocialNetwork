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
            setTimeout(() => catchFailedRetriedConnection(ws, setErrorMessage), 50);
        } else if (err instanceof WebsocketConnectionError) {
            console.error(err);
            setErrorMessage("Failed Websocket connection!");
        }
    }
}

const ActiveChat = (props: ActiveChatProps) => {
    const navigate = useNavigate();

    const [ retryToggler, setRetryToggler ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

    const socket = useRef<WebSocket>(connectWSChat(props.activeChatData.token));

    useEffect(() => {
        try {
            checkWSConnEstablished(socket.current)
        } catch (err) {
            if (err instanceof WebsocketConnectionError) {
                socket.current.close()
                socket.current = connectWSChat(props.activeChatData.token)
                catchFailedRetriedConnection(socket.current, setErrorMessage);
            }
        }

        const websocketCloseEventListener = () => {
            navigate(chatsURI);
            window.alert("Connection unexpectedly closed");
        }

        socket.current.addEventListener("close", websocketCloseEventListener);

        return () => {
            console.log("CLOSING CONNECTION")
            socket.current.close();
            socket.current.removeEventListener("close", websocketCloseEventListener);
        }

    }, [retryToggler])


    const sendMessageWrapper = (message: string) => {
        try {
            checkWSConnEstablished(socket.current);
            sendMessage(socket.current, message);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => sendMessageWrapper(message), 50);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const changeMessageWrapper = (message: string, messageId: string, local: boolean) => {
        try {
            checkWSConnEstablished(socket.current);
            changeMessage(socket.current, message, messageId)
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => changeMessageWrapper(message, messageId, local), 50);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const deleteMessageWrapper = (messageId: string, local: boolean) => {
        try {
            checkWSConnEstablished(socket.current);
            deleteMessage(socket.current, messageId);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => deleteMessageWrapper(messageId, local), 50);
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

    return(
        <div>
            <MessagesList chatId={props.chatId} changeMessageCallable={changeMessageHistory} deleteMessageCallable={deleteMessageHistory} websocket={socket.current} />
            <LocalMessagesList changeMessageFunc={changeMessageLocal} deleteMessageFunc={deleteMessageLocal} websocket={socket.current} />
            <MessageBar sendMessageCallable={sendMessageWrapper} />
        </div>
    );
};

export default ActiveChat;