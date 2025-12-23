import React, { RefObject, useEffect, useState } from "react";
import { ChatMessage, mapSingleMessage, mapWebsocketReceivedMessage } from "../../../../fetching/responseDTOs.ts";

import MessageBar from "./messageBar.tsx";

// Exporting for ref forwarding function in ActiveChat
interface LocalMessagesListProps {
    websocketRef: RefObject<WebSocket>,
    changeMessageCallable: (message: string, messageId: string) => void,
    deleteMessageCallable: (messageId: string) => void,
    sendMessageCallable: (message: string, tempId: string) => void
}

const LocalMessagesHandler = (props: LocalMessagesListProps) => {
    const [ localMessages, setLocalMessages ] = useState<ChatMessage[]>([]);
    const [ currentMessageEditing, setCurrentMessageEditing ] = useState<null | string>(null);
    const [ currentMessageEditingId, setCurrentMessageEditingId ] = useState<null | string>(null);

    const sendMessageOptimistically = (message: string): void => {
        const oldLocalMessages = [...localMessages];

        // Creating temp sample message, until backend websocket message distribution
        const tempId = crypto.randomUUID()
        const newLocalMessages = [...oldLocalMessages, mapSingleMessage(tempId, message, new Date(), { userId: tempId, username: "", avatarURL: null }, tempId)];

        setLocalMessages(newLocalMessages);

        props.sendMessageCallable(message, tempId);
    } 

    const deleteMessageFromState = (messageId: string): void => {
        let newMessagesDelete = [...localMessages];
        
        newMessagesDelete = newMessagesDelete.filter((localMessage) => {
            return localMessage.messageId != messageId;
        });
        
        setLocalMessages(newMessagesDelete);
        props.deleteMessageCallable(messageId);
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
                return mapSingleMessage(messageId, newMessage, localMessage.sent, localMessage.owner, null);
            } 
            return localMessage;
        })

        setLocalMessages(newMessagesChange);

        props.changeMessageCallable(newMessage, messageId);
        setCurrentMessageEditing(null);
        setCurrentMessageEditingId(null);
    }

    const updateMessageStatusInState = (newMsg: ChatMessage): void => {
        const oldLocalMessages = [...localMessages];
        
        const newLocalMessages = oldLocalMessages.map((msg) => {
            if (msg.tempId == newMsg.tempId) return newMsg
            return msg;
        })        

        setLocalMessages(newLocalMessages);
    }

    const receiveWSMessageLocal = (event: MessageEvent): void => {
        const incomingMessage = event.data;
        const mappedMessage = mapWebsocketReceivedMessage(incomingMessage);

        switch (incomingMessage.action) {
            case "send":
                if (!mappedMessage.text) return;

                updateMessageStatusInState(mapSingleMessage(mappedMessage.messageId, mappedMessage.text, mappedMessage.sent, mappedMessage.owner, null));
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
        props.websocketRef.current.addEventListener("message", receiveWSMessageLocal);
        return () => {
            props.websocketRef.current.removeEventListener("message", receiveWSMessageLocal);
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