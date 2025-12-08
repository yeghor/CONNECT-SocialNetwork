import React, { useState } from "react";

interface MessageBarProps {
    sendMessageCallable: (message: string) => void;
}

const MessageBar = (props: MessageBarProps) => {
    const [ message, setMessage ] = useState("");

    return(
        <div className="rounded-full border-3 border-white bg-white/10 w-full h-8 flex">
            <input 
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-full"
            placeholder="..."
            />
            <button className="bg-white/20" onClick={() => props.sendMessageCallable(message)}>Send</button>
        </div>
    );
};

export default MessageBar;