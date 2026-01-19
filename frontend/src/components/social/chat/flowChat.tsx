import React from "react";
import { Chat } from "../../../fetching/responseDTOs.ts";
import { Link, useNavigate } from "react-router-dom";
import { specificChatURI } from "../../../consts.ts";


const FlowChat = (chatData: Chat) => {
    const navigate = useNavigate()

    return (
        <Link to=   {specificChatURI(chatData.chatId)}>
            <div className="bg-white/10 rounded-lg p-4 flex justify-start items-center gap-4">
                <img 
                    src={chatData.chatImageURL ? chatData.chatImageURL : "/uknown-user-image.jpg"} 
                    alt={chatData.chatName}
                    className="w-16 h-16 object-cover rounded-full"
                />

                <h3 className="text-lg font-semibold text-white">
                    {chatData.chatName}
                </h3>
                { chatData.participantsCount > 2 ? <p className="text-sm text-gray-200">
                    {chatData.participantsCount} Participants
                </p> : null }
                <p className="flex justify-start gap-4 text-white"><span>{chatData.lastMessage.text.slice(0, 20)}...</span>{chatData.lastMessage.sent.toDateString()}<span></span></p>
            </div>
        </Link>
    );
};

export default FlowChat;