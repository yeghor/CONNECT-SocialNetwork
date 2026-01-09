import React from "react";
import {ChatResponse} from "../../../fetching/responseDTOs.ts";
import {Link} from "react-router-dom";
import {specificChatURI} from "../../../consts.ts";

interface FlowChatProps {
    chatId: string
    participants: number
}

const FlowChat = (props: FlowChatProps) => {

    return(
        <Link to={specificChatURI(props.chatId)}>
            <div className="bg-white">
                <p>{props.chatId}</p>
                <p>{props.participants}</p>
            </div>
        </Link>

    );
};

export default FlowChat;