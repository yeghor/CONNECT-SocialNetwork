import React, { useEffect, useState } from "react";
import { ChatMessage, mapSingleMessage, mapWebsocketReceivedMessage } from "../../../../fetching/responseDTOs.ts";

import MessageBar from "./messageBar.tsx";

interface LocalMessagesListProps {
    websocket: WebSocket;
    changeMessageFunc: (message: string, messageId: string) => void;
    deleteMessageFunc: (messageId: string) => void;
}

// TODO: Optimistic render

const LocalMessagesHandler = (props: LocalMessagesListProps) => {
    const [ localMessages, setLocalMessages ] = useState<ChatMessage[]>([]);
    const [ currentMessageEditing, setCurrentMessageEditing ] = useState<null | string>(null);
    const [ currentMessageEditingId, setCurrentMessageEditingId ] = useState<null | string>(null);

    const sendMessageOptimistically = (message: string): void => {

    } 

    const deleteMessageFromState = (messageId: string): void => {
        let newMessagesDelete = [...localMessages];
        
        newMessagesDelete = newMessagesDelete.filter((localMessage) => {
            return localMessage.messageId != messageId;
        });

        setLocalMessages(newMessagesDelete);
        props.deleteMessageFunc(messageId);
        setCurrentMessageEditing(null);
        setCurrentMessageEditingId(null);
    }

    const changeMessageInState = (newMessage: string | null, messageId: string): void => {
        if (!newMessage) {
            return;
        }

        let newMessagesChange = [...localMessages];
        newMessagesChange = newMessagesChange.map((localMessage) => {
            if (localMessage.messageId == messageId && newMessage) {
                return mapSingleMessage(messageId, newMessage, localMessage.sent, localMessage.owner);
            } 
            return localMessage;
        })

        setLocalMessages(newMessagesChange);

        props.changeMessageFunc(newMessage, messageId);
        setCurrentMessageEditing(null);
        setCurrentMessageEditingId(null);
    }

    const receiveWSMessageLocal = (event: MessageEvent): void => {
        const incomingMessage = event.data;
        const mappedMessage = mapWebsocketReceivedMessage(incomingMessage);

        switch (incomingMessage.action) {
            case "send":
                if (!mappedMessage.text) {
                    return;
                }
                const newLocalMessage = mapSingleMessage(mappedMessage.messageId, mappedMessage.text, mappedMessage.sent, mappedMessage.owner);
                setLocalMessages((prevState) => [...prevState, newLocalMessage]);
                break;
            case "change":
                changeMessageInState(mappedMessage.text, mappedMessage.messageId);
                break;
            case "delete":
                deleteMessageFromState(mappedMessage.messageId);
        }
    };

    // const changeLocalMessage = (message: string, messageId: string) => {
    //     if (!currentMessageEditing || !currentMessageEditingId) {
    //         return;
    //     }
    //     changeMessageInState(message, messageId);
    // };

    // const deleteLocalMessage = (messageId: string) => {
    //     deleteMessageFromState(messageId);
    // }

    // // component logic useEffect
    // useEffect(() => {

    // }, []);

    // websocket handling useEffect
    useEffect(() => {
        props.websocket.addEventListener("message", receiveWSMessageLocal);
        return () => {
            props.websocket.removeEventListener("message", receiveWSMessageLocal);
        }
    }, []);

    return (
        <div>
            <ul>
                {localMessages.map((message, index) => (
                    <li key={message.messageId}>
                        <div className="rounded-full bg-white">
                            <p className="text-black">{message.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <MessageBar sendMessageLocally={sendMessageOptimistically} />            
        </div>
    );
};

export default LocalMessagesHandler;