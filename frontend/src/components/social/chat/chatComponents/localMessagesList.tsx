import React, {JSX} from "react";
import {ChatMessage} from "../../../../fetching/responseDTOs.ts";

interface LocalMessagesListProps {
    messagesData: ChatMessage[];
    changeMessageFunc: CallableFunction;
    deleteMessageFunc: CallableFunction;
}

const LocalMessagesList = (props: LocalMessagesListProps) => {
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