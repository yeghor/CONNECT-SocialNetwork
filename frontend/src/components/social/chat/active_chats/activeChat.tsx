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

    let socket = useRef<WebSocket>(connectWSChat(props.activeChatData.token));
    catchFailedRetriedConnection(socket.current, setErrorMessage);

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

        return () => {
            console.log("CLOSING CONNECTION")
            socket.current.close();
        }

    }, [retryToggler])
    


    socket.current.addEventListener("message", (event) => {
        console.log("Message from WS connection");
        console.log(event.data);
    })

    const sendMessageWrapper = (message: string) => {
        try {
            checkWSConnEstablished(socket.current);
            sendMessage(socket.current, message);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => sendMessageWrapper(message), 200);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const changeMessageWrapper = (message: string, messageId: string) => {
        try {
            checkWSConnEstablished(socket.current);
            changeMessage(socket.current, message, messageId)
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => changeMessageWrapper(message, messageId), 200);
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
            }
        }
    };

    const deleteMessageWrapper = (messageId: string) => {
        try {
            checkWSConnEstablished(socket.current);
            deleteMessage(socket.current, messageId);
        } catch(err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(() => deleteMessageWrapper(messageId), 200);
                return;
            } else if (err instanceof WebsocketConnectionError) {
                setRetryToggler((prevState) => !prevState);
                return;
            }
        }
    };

    const receiveWebsocketMessage = (websocket: WebSocket, message: MessageEvent) => {
        console.log("Received Websocket message", websocket);
    }

    socket.current.addEventListener("message", (event) => {
        receiveWebsocketMessage(socket.current, event.data);
    });

    socket.current.addEventListener("close", () => {
        navigate(chatsURI);
        window.alert("Connection closed");
    })

    return(
        <div>
            <MessagesList chatId={props.chatId} />
            <LocalMessagesList messagesData={localMessages} changeMessageFunc={changeMessage} deleteMessageFunc={deleteMessage} />
            <MessageBar sendMessageCallable={sendMessageWrapper} />
        </div>
    );
};

export default ActiveChat;