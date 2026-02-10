import React from "react";
import { Chat } from "../../../fetching/responseDTOs.ts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { specificChatURI } from "../../../consts.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";
import { fetchLeaveChat } from "../../../fetching/fetchChatWS.ts";

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
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const { chatId } = useParams();

    let chatLink: string | undefined = specificChatURI(chatData.chatId);

    if (chatId) {
        chatLink = chatId === chatData.chatId ? undefined : chatLink;
    }

    const handleLeaveChat = async (e: React.MouseEvent) => {
        e.preventDefault();
        const confirmLeave = confirm(`Are you sure that you want to leave chat: ${chatData.chatName}?`);
        if (confirmLeave) {
            await safeAPICall(tokens, fetchLeaveChat, navigate, undefined);
        }
    };

    return (
        <FlowChatNavigationWrapper linkURI={chatLink}>
            <div className="bg-white/10 rounded-lg p-4 flex justify-between items-center gap-4 hover:bg-white/20 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                    <img 
                        src={chatData.chatImageURL ? chatData.chatImageURL : "/uknown-user-image.jpg"} 
                        alt={chatData.chatName}
                        className="w-16 h-16 object-cover rounded-full"
                    />

                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-white">
                            {chatData.chatName}
                        </h3>
                        
                        <div className="flex flex-col gap-1">
                            { chatData.participantsCount > 2 && (
                                <p className="text-sm text-gray-300">
                                    {chatData.participantsCount} Participants
                                </p>
                            )}
                            
                            { chatData.lastMessage && (
                                <p className="text-sm text-gray-400 flex gap-2">
                                    <span>{chatData.lastMessage.text.slice(0, 20)}...</span>
                                    <span className="opacity-60">{chatData.lastMessage.sent.toLocaleDateString()}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button 
                        onClick={handleLeaveChat}
                        className="p-2 rounded-full hover:bg-white/10 text-white transition-all"
                        title="Выйти из чата"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>
                </div>
            </div>            
        </FlowChatNavigationWrapper>
    );
};

export default FlowChat;