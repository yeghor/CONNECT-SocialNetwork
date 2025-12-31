import React, { useState, useEffect, useRef, forwardRef, RefObject } from "react";
import ChatMessagesHandler from "../chatComponents/chatMessagesHandler.tsx";

import { connectWSChat,
    sendMessage, changeMessage, deleteMessage,
    checkWSConnEstablished,
    WebsocketNotReady,
    WebsocketConnectionError
 } from "../../../../fetching/chatWS.ts";
import {ChatConnectData, ChatMessage} from "../../../../fetching/responseDTOs.ts";

import { useNavigate } from "react-router";
import { chatsURI, internalServerErrorURI } from "../../../../consts.ts";
import { C } from "react-router/dist/development/index-react-server-client-DKvU8YRr";

interface ActiveChatProps {
    activeChatData: ChatConnectData,
    chatId: string
}

const ActiveChat = (props: ActiveChatProps) => {
    const navigate = useNavigate();

    const [ retryToggler, setRetryToggler ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ toRender, setToRender ] = useState(false);

    const socket = useRef<WebSocket | null>(null);

    const sendMessageWrapper = (socket: WebSocket, message: string, tempId: string) => {
        try {
            checkWSConnEstablished(socket);
            sendMessage(socket, message, tempId);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => sendMessageWrapper(socket, message, tempId), 50);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const changeMessageWrapper = (socket: WebSocket, message: string, messageId: string) => {
        try {
            checkWSConnEstablished(socket);
            changeMessage(socket, message, messageId)
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => changeMessageWrapper(socket, message, messageId), 50);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const deleteMessageWrapper = (socket: WebSocket, messageId: string): void => {
        try {
            checkWSConnEstablished(socket);
            deleteMessage(socket, messageId);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => deleteMessageWrapper(socket, messageId), 50);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const sendMessageProps = (message: string, tempId: string) => sendMessageWrapper(socket.current as WebSocket, message, tempId);
    const deleteMessageProps = (messageId: string) => deleteMessageWrapper(socket.current as WebSocket, messageId);
    const changeMessageProps = (message: string, messageId: string) => changeMessageWrapper(socket.current as WebSocket, message, messageId)

    const websocketCloseEventListener = (event: CloseEvent) => {
        // in question
        setToRender(false);

        navigate(`/${chatsURI}`);
        window.alert("Connection unexpectedly closed");
        console.log(event.code, event.reason);
    }

    /* Toggles toRender flag to safely render nested components when WebSocket connection is ready */
    const websocketOpenEventListener = () => {
        setToRender(true);
    }

    useEffect(() => {
        socket.current = connectWSChat(props.activeChatData.token);

        socket.current.addEventListener("open", websocketOpenEventListener);
        socket.current.addEventListener("close", websocketCloseEventListener);

        return () => {
            if (!socket.current) {
                return;
            }

            console.log("CLOSING CONNECTION");

            socket.current.removeEventListener("open", websocketOpenEventListener);
            socket.current.removeEventListener("close", websocketCloseEventListener);
            
            if (socket.current.readyState !== socket.current.CLOSED) {
                socket.current.close();
            }
        }

    }, [])

    if (!toRender) {
        return (
            <div className="text-white">
                Loading
            </div>
        );
    }

    // Passing socket as RefObject<WebSocket> because code above guarantees that it isn't null
    return(
        <div>
            <ChatMessagesHandler websocketRef={socket as RefObject<WebSocket>} chatId={props.chatId} sendMessageCallable={sendMessageProps} changeMessageCallable={changeMessageProps} deleteMessageCallable={deleteMessageProps} />
        </div>
    );  

};

export default ActiveChat;