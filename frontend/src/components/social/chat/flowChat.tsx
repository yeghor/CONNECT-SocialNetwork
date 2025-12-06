import React from "react";
import {ChatResponse} from "../../../fetching/responseDTOs.ts";
import {Link} from "react-router-dom";
import {specificChatURI} from "../../../consts.ts";

interface FlowChatProps {
    chatData: ChatResponse;
}

const FlowChat = (props: FlowChatProps) => {
    return(
        <Link to={specificChatURI(props.chatData.chatId)}>
            <div>
                <p>{props.chatData.chatId}</p>
                <p>{props.chatData.participants}</p>
            </div>
        </Link>

    );
};

export default FlowChat;