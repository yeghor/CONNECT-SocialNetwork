import React, {JSX, useEffect, useState} from "react";
import {ChatMessage} from "../../../../fetching/responseDTOs.ts";

interface LocalMessagesListProps {
    websocket: WebSocket;
    changeMessageFunc: CallableFunction;
    deleteMessageFunc: CallableFunction;
}

const LocalMessagesList = (props: LocalMessagesListProps) => {
    const [ localMessages, setLocalMessages ] = useState<ChatMessage[]>([]);
    const [ currentMessageEditing, setCurrentMessageEditing ] = useState<null | string>(null);
    const [ currentMessageEditingId, setCurrentMessageEditingId ] = useState<null | string>(null);

    const receiveWSMessageLocal = (event: MessageEvent) => {
        const incomingMessage = event.data as MessageEvent;
    };

    const changeLocalMessage = (message: string, messageId: string) => {
        if (!currentMessageEditing || !currentMessageEditingId) {
            return;
        }
    };

    const deleteLocalMessage = (messageId: string) => {

    }

    // component logic useEffect
    useEffect(() => {

    }, []);

    // websocket handling useEffect
    useEffect(() => {
        props.websocket.addEventListener("message", receiveWSMessageLocal);
        return () => {
            props.websocket.removeEventListener("message", receiveWSMessageLocal);
        }
    }, []);

    return (
        <ul>
            {props.messagesData.map((message, index) => (
                <li key={message.messageId}>
                    <div className="rounded-full bg-white">
                        <p className="text-black">{message.text}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default LocalMessagesList;