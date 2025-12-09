import React, { useState, useEffect, useRef } from "react";
import MessagesList from "./chatComponents/messagesList.tsx";
import MessageBar from "./chatComponents/messageBar.tsx";

import { connectWSChat,
    sendMessage, changeMessage, deleteMessage,
    checkWSConnEstablished,
    WebsocketNotReady,
    WebsocketConnectionError
 } from "../../../fetching/chatWS.ts";
import { ChatConnectData } from "../../../fetching/responseDTOs.ts";

interface ActiveChatProps {
    activeChatData: ChatConnectData,
    chatId: string
}

const ActiveChat = (props: ActiveChatProps) => {
    let socket = useRef<WebSocket>(connectWSChat(props.activeChatData.token));
    const [ historyMessages, setHistoryMessages ] = useState([]);
    const [ localMessages, setLocalMessages ] = useState([]);
    const [ retryToggler, setRetryToggler ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

    const catchFailedRetriedConnection = (ws: WebSocket) => {
        try {
            checkWSConnEstablished(ws);
        } catch (err) {
            if (err instanceof WebsocketNotReady) {
                setTimeout(catchFailedRetriedConnection, 200);
            } else if (err instanceof WebsocketConnectionError) {
                console.error(err);
                setErrorMessage("Failed WebSocket connection!");
            }            
        }
    }

    useEffect(() => {
        const newSocket = connectWSChat(props.activeChatData.token);
        catchFailedRetriedConnection(newSocket)
        socket.current = newSocket
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

    return(
        <div>
            <MessagesList chatId={props.chatId} />
            <MessageBar sendMessageCallable={sendMessageWrapper} />
        </div>
    );
};

export default ActiveChat;