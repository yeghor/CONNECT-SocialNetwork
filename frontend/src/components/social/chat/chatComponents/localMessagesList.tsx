import React, {JSX, useEffect} from "react";
import {ChatMessage} from "../../../../fetching/responseDTOs.ts";

interface LocalMessagesListProps {
    websocket: WebSocket;
    messagesData: ChatMessage[];
    changeMessageFunc: CallableFunction;
    deleteMessageFunc: CallableFunction;
}

const LocalMessagesList = (props: LocalMessagesListProps) => {
    const receiveWSMessageLocal = (event: MessageEvent) => {
        const incomingMessage = event.data as MessageEvent;
    };

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