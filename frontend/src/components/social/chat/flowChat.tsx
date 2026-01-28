import React from "react";
import { Chat } from "../../../fetching/responseDTOs.ts";
import { Link, useParams } from "react-router-dom";
import { specificChatURI } from "../../../consts.ts";

const FlowChatNavigationWrapper = (props: {
    linkURI: string | undefined;
    children: React.ReactNode;
}) => {
    return (
        <div>
            {props.linkURI ? (
                <Link to={props.linkURI}>{props.children}</Link>
            ) : (
                <div>{props.children}</div>
            )}
        </div>
    );
};

const FlowChat = (chatData: Chat) => {
    const { chatId } = useParams()

    /*
    * This chatLink logic is important, to prevent ActiveChat component remounting.
    * When user clicks on the same FlowChat component
    */

    let chatLink: string | undefined = specificChatURI(chatData.chatId);

    if (chatId) {
        chatLink = chatId === chatData.chatId ? undefined : chatLink;
    }
    console.log(chatData.lastMessage)
    return (
        <FlowChatNavigationWrapper linkURI={chatLink}>
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
                { chatData.lastMessage ? <p className="flex justify-start gap-4 text-white"><span>{chatData.lastMessage.text.slice(0, 20)}...</span>{chatData.lastMessage.sent.toDateString()}<span></span></p> : null }
            </div>            
        </FlowChatNavigationWrapper>
    );
};

export default FlowChat;