import React, { useState } from "react";

interface MessageBarProps {
    sendMessageLocally: (message: string) => void;
}

const MessageBar = (props: MessageBarProps) => {
    const [ message, setMessage ] = useState("");
    const [ sendTimeout, setSendTimeout ] = useState(false);

    const sendMessage = (message: string): void => {
        if (sendTimeout) {
            return;
        }
        setSendTimeout(true);
        props.sendMessageLocally(message);
        setTimeout(() => setSendTimeout(false), 100);
    }

    return(
        <div className="rounded-full border-3 border-white bg-white/10 w-full h-8 flex">
            <input 
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-full"
            placeholder="..."
            />
            <button className="bg-white/20" onClick={() => props.sendMessageLocally(message)}>Send</button>
        </div>
    );
};

export default MessageBar;