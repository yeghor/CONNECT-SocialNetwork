import React, { useState } from "react";
import MessageBar from "./chatComponents/messageBar";

interface MakeNewChatProps {
    createNewOtherUserId: string
}

const tempSendMessage = (message: string) => {
    return;
};

const MakeNewChat = (props: MakeNewChatProps) => {
    return (
        <div>
            <MessageBar sendMessageCallable={tempSendMessage} />
        </div>
    );
};

export default MakeNewChat;