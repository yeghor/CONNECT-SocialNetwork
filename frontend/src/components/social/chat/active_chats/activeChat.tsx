import React, { useState, useEffect, useRef, forwardRef, RefObject, useLayoutEffect } from "react";
import ChatMessagesHandler from "../chatComponents/chatMessagesHandler.tsx";

import { connectWSChat,
    sendMessage, changeMessage, deleteMessage,
    checkWSConnEstablished,
    WebsocketNotReady,
    WebsocketConnectionError
 } from "../../../../fetching/fetchChatWS.ts";
import { ChatConnectData } from "../../../../fetching/responseDTOs.ts";

import { useNavigate } from "react-router";
import { chatsURI } from "../../../../consts.ts";
import LoadingIndicator from "../../../base/centeredLoadingIndicator.tsx";

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

        window.alert("Connection unexpectedly closed");
        navigate(`/${chatsURI}`);
        console.log(event.code, event.reason);
    }

    /* Toggles toRender flag to safely render nested components when WebSocket connection is ready */
    const websocketOpenEventListener = () => {
        setToRender(true);
    }

    useEffect(() => {
        if (props.chatId !== props.activeChatData.chatId) {
            return;
        }
        console.log("reconnecting")

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

    useEffect(() => {
        setToRender(false);

        if (props.chatId !== props.activeChatData.chatId) {
            return;
        }

        if (socket.current) {
            socket.current = null;
        }

        socket.current = connectWSChat(props.activeChatData.token);

        socket.current.addEventListener("open", websocketOpenEventListener);
        socket.current.addEventListener("close", websocketCloseEventListener);

        setToRender(true);

        return () => {
            if (!socket.current) {
                return;
            }

            console.log("CLOSING CONNECT11ION");

            socket.current.removeEventListener("open", websocketOpenEventListener);
            socket.current.removeEventListener("close", websocketCloseEventListener);
            
            if (socket.current.readyState !== socket.current.CLOSED) {
                socket.current.close();
            }
        }
    }, [props])

    if (!toRender) {
        return ( <LoadingIndicator customMessage={undefined} /> );
    }

    // Passing socket as RefObject<WebSocket> because code above guarantees that it isn't null
    return(
        <div className="h-max">
            <ChatMessagesHandler
                websocketRef={socket as RefObject<WebSocket>}
                participantsData={props.activeChatData.participantsData}
                chatId={props.chatId} sendMessageCallable={sendMessageProps}
                isGroup={props.activeChatData.isGroup}
                changeMessageCallable={changeMessageProps}
                deleteMessageCallable={deleteMessageProps}
            />
        </div>
    );  

};

export default ActiveChat;