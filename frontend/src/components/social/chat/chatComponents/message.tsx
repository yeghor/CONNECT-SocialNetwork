import React, { useState } from "react";
import { ChatMessage } from "../../../../fetching/responseDTOs.ts";

interface ChatMessageProps {
    messageData: ChatMessage;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void
}

const ChatMessageComp = (props: ChatMessageProps) => {
    const [ changeMessage, setChangeMessage  ] = useState(false);
    const [ deleteMessage, setDeleteMessage ] = useState(false);
    const [ currentMessage, setCurrentMessage ] = useState(props.messageData.text ?? "");

    return(
        <div>
            <p>{props.messageData.messageId}</p>
            <p>{props.messageData.text}</p>
            <div onClick={() => setChangeMessage((prevState) => !prevState)} className="bg-white p-1 m-2">change</div>
            <div onClick={() => setDeleteMessage((prevState) => !prevState)} className="bg-white p-1 m-2">delete</div>

            {changeMessage ? <div onClick={() => props.changeMessageCallable(currentMessage, props.messageData.messageId)} className= "p-1 bg-white">confirm change</div> : null}
            {deleteMessage ? <div onClick={() => props.deleteMessageCallable(props.messageData.messageId)} className= "p-1 bg-white">confirm delete</div> : null}
        </div>
    );
};

export default ChatMessageComp;