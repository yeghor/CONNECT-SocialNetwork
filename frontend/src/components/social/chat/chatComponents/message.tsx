import React, { useState } from "react";
import { ChatMessage } from "../../../../fetching/responseDTOs.ts";

interface ChatMessageProps {
    messageData: ChatMessage;
    isMy: boolean;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void
}

const ChatMessageComp = (props: ChatMessageProps) => {
    const [ messageAction, setMessageAction ] = useState<"change" | "delete" | null>(null);
    const [ currentMessage, setCurrentMessage ] = useState(props.messageData.text ?? "");

    const messageActionHandler = () => {
        switch (messageAction) {
            case "change":
                props.changeMessageCallable(currentMessage, props.messageData.messageId)
                break;
            case "delete":
                props.deleteMessageCallable(props.messageData.messageId)
        }
    }

    return(
        <div className="w-full h-full bg-white">
            <p>{props.messageData.messageId}</p>

            { messageAction === "delete" ? <p className="break-normal w-max w-full">{props.messageData.text}</p> : <input onChange={(e) => setCurrentMessage(e.target.value)} type="text" defaultValue={`${props.messageData.text}`} /> }


            <div onClick={ () =>  setMessageAction("change") } className="bg-white p-1 m-2">change</div>
            <div onClick={ () => setMessageAction("delete") } className="bg-white p-1 m-2">delete</div>

            {messageAction ? <div>
                <div onClick={() => messageActionHandler() } className= "p-1 bg-white">Confirm change</div>
                <div onClick={() => setMessageAction(null) } className= "p-1 bg-white">Discard</div>
            </div> : null}
        </div>
    );
};

export default ChatMessageComp;