import React, { useState, useEffect } from "react";
import MessagesList from "./chatComponents/messagesList.tsx";
import MessageBar from "./chatComponents/messageBar.tsx";

interface ActiveChatProps {
    activeChatData: any,
}

const ActiveChat = (props: ActiveChatProps) => {
    return(
        <div>
            <MessagesList />
            <MessageBar />
        </div>
    );
};

export default ActiveChat;