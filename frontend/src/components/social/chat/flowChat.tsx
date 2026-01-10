import React from "react";
import { Chat } from "../../../fetching/responseDTOs.ts";
import { Link } from "react-router-dom";
import { specificChatURI } from "../../../consts.ts";

const FlowChat = (props: Chat) => {
    return (
        <Link to={specificChatURI(props.chatId)}>
            <div className="bg-white/10 rounded-lg p-4 flex justify-start items-center gap-4">
                <img 
                    src={props.chatImageURL ? props.chatImageURL : "/uknown-user-image.jpg"} 
                    alt={props.chatName}
                    className="w-16 h-16 object-cover rounded-full"
                />

                <h3 className="text-lg font-semibold text-white">
                    {props.chatName}
                </h3>
                { props.participantsCount > 2 ? <p className="text-sm text-gray-200">
                    {props.participantsCount} Participants
                </p> : null }
            </div>
        </Link>
    );
};

export default FlowChat;