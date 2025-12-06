import React from "react";
import {ChatResponse} from "../../../fetching/responseDTOs.ts";

interface FlowChatProps {
    chatData: ChatResponse;
}

const FlowChat = (props: FlowChatProps) => {
    return(
        <div>
            <p>{props.chatData.chatId}</p>
            <p>{props.chatData.participants}</p>
        </div>
    );
};

export default FlowChat;