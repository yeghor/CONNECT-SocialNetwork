import React, { useState } from "react";
import { ChatMessage, ChatParticipantData } from "../../../../fetching/responseDTOs.ts";
import OwnerComponent from "../../post/owner.tsx";

export interface ChatMessageProps {
    messageData: ChatMessage;
    ownerData: ChatParticipantData;
    isSending: boolean;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void
}

/* If ownerData=null -> rendering component */
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
        <div className={`${ props.isSending ? "opacity-70" : null} flex ${props.ownerData.me ? "justify-end" : "justify-start"} `}>
            <div className="w-1/2 h-full bg-white mx-2">
                <p className="break-normal w-full">{props.isSending ? "Sending" :props.messageData.messageId}</p>

                { messageAction === "change" ? <input onChange={(e) => setCurrentMessage(e.target.value)} type="text" defaultValue={`${props.messageData.text}`} /> : <p className="break-normal w-full">{props.messageData.text}</p> }


                <div onClick={ () =>  setMessageAction("change") } className="bg-white p-1 m-2">change</div>
                <div onClick={ () => setMessageAction("delete") } className="bg-white p-1 m-2">delete</div>

                {messageAction ? <div>
                    <div onClick={() => messageActionHandler() } className= "p-1 bg-white">Confirm change</div>
                    <div onClick={() => setMessageAction(null) } className= "p-1 bg-white">Discard</div>
                </div> : null}                
            </div>
        </div>
    );
};

export default ChatMessageComp;