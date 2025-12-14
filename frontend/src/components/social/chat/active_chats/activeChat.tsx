import React, { useState, useEffect, useRef } from "react";
import MessagesList from "../chatComponents/messagesList.tsx";
import MessageBar from "../chatComponents/messageBar.tsx";

import { connectWSChat,
    sendMessage, changeMessage, deleteMessage,
    checkWSConnEstablished,
    WebsocketNotReady,
    WebsocketConnectionError
 } from "../../../../fetching/chatWS.ts";
import { ChatConnectData } from "../../../../fetching/responseDTOs.ts";

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
    const [ localMessages, setLocalMessages ] = useState([]);
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

    return(
        <div>
            <MessagesList chatId={props.chatId} />
            <MessageBar sendMessageCallable={sendMessageWrapper} />
        </div>
    );
};

export default ActiveChat;