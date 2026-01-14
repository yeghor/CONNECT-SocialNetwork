import React, { FormEvent, useEffect, useState } from "react";
import { chatMessageIsTooBigMessage, chatMessageMaxLength } from "../../../../consts";
import { measureElement } from "@tanstack/react-virtual";

interface MessageBarProps {
    sendMessageLocally: (message: string) => void;
}

const MessageBar = (props: MessageBarProps) => {
    const [ message, setMessage ] = useState("");
    const [ sendTimeout, setSendTimeout ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);

    const sendMessage = (e: FormEvent): void => {
        e.preventDefault()
        if (sendTimeout) {
            return;
        } else if (message.length > chatMessageMaxLength || message.length === 0) {
            setErrorMessage(chatMessageIsTooBigMessage);
            return;
        }
        setSendTimeout(true);
        props.sendMessageLocally(message);
        setMessage("");
        setTimeout(() => setSendTimeout(false), 100);
    }

    const setMessageWrapper = (message: string): void => {
        setMessage(message);
        setErrorMessage(null);
    } 

    return(
        <div className="relative w-max-3xl mx-auto">
            {/* Error Message - Absolutely positioned so it doesn't jump the layout when it appears */}
            {errorMessage && (
                <div className="absolute -top-6 left-10 text-[10px] uppercase font-bold tracking-widest text-red-400 animate-pulse">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={(e) => sendMessage(e)} className="group flex items-center gap-2 bg-white/5 backdrop-blur-md border-2 border-white/10 p-1.5 rounded-2xl shadow-2xl transition-all focus-within:border-white/20 focus-within:bg-white/10">
                
                <input 
                    type="text"
                    value={message}
                    onChange={(e) => setMessageWrapper(e.target.value)}
                    className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder-gray-500 outline-none"
                    placeholder="Type a message..." 
                />

                <button 
                    type="submit"
                    className="bg-white/10 hover:bg-white/20 text-white text-[11px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessageBar;