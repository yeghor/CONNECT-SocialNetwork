import React, { useState } from "react";
import { ChatMessage, ChatParticipant } from "../../../../fetching/DTOs.ts";

export interface ChatMessageProps {
    messageData: ChatMessage;
    ownerData: ChatParticipant;
    isSending: boolean;
    isGroup: boolean;
    changeMessageCallable: ((message: string, messageId: string) => void);
    deleteMessageCallable: ((messageId: string) => void);
}

const FlowMessage = (props: ChatMessageProps) => {
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
        setMessageAction(null);
    }

    const isMe = props.ownerData.me;
    const isSending = props.isSending;

    return (
        <div className={`flex w-full mb-4 items-end ${isMe ? "justify-end" : "justify-start"}`}>
            
            {!isMe && (
                <div className="flex-shrink-0 mr-3 mb-1">
                    <img 
                        src={props.ownerData.avatarURL ?? "/uknown-user-image.jpg"} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />   
                </div>
            )}

            <div 
                className={`relative w-1/3 px-4 py-3 rounded-xl shadow-lg transition-all border bg-white/10 border-white/20 border-3 ${
                isSending ? "opacity-50" : "opacity-100"
                } ${
                isMe 
                    ? "bg-white/10 border-white/20 text-white rounded-tr-none" 
                    : "bg-black/20 border-white/5 text-gray-200 rounded-tl-none"
                }`}
            >
                <div className="text-[12px] mb-1 font-bold tracking-widest text-gray-100">
                    {props.isGroup && !props.messageData.me ? props.messageData.owner.username : null }
                </div>

                <div className={`text-[12px] mb-1 font-bold tracking-widest ${isMe ? "text-gray-200" : "text-gray-400"}`}>
                    {isSending ? "Sending..." : props.messageData.sent.toLocaleString("en-GB", {   weekday: "long", year: "numeric", month: "long", day: "numeric", hour12: true, hour: "2-digit", minute: "2-digit" })}
                </div>

                {messageAction === "change" ? (
                    <div className="flex flex-col gap-2">
                        <input
                            autoFocus
                            className="p-2 rounded bg-black/40 text-white outline-none border border-white/20 w-full text-sm"
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            type="text"
                            defaultValue={props.messageData.text}
                        />
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {props.messageData.text}
                    </p>
                )}

                {!messageAction && !isSending && isMe && (
                    <div className="flex gap-3 mt-2 pt-2 border-t border-white/10 text-[11px] font-medium">
                        <span 
                            onClick={() => setMessageAction("change")} 
                            className="cursor-pointer hover:text-white text-gray-400 transition"
                        >
                            Edit
                        </span>
                        <span 
                            onClick={() => setMessageAction("delete")} 
                            className="cursor-pointer hover:text-red-400 text-red-300/70 transition"
                        >
                            Delete
                        </span>
                    </div>
                )}

                {messageAction && (
                    <div className="mt-3 flex gap-2 border-t border-white/10 pt-2">
                        <button 
                            onClick={() => messageActionHandler()} 
                            className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition"
                        >
                            Confirm
                        </button>
                        <button 
                            onClick={() => setMessageAction(null)} 
                            className="text-[10px] bg-transparent text-gray-400 hover:text-white px-2 py-1 transition"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowMessage;