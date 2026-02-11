import React, { useState, useRef, useEffect } from "react";
import { Chat } from "../../../fetching/DTOs.ts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { specificChatURI } from "../../../consts.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";
import { fetchLeaveChat as fetchLeaveGroup } from "../../../fetching/fetchChatWS.ts";

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
    
    const [ isMenuOpen, setIsMenuOpen ] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    let chatLink: string | undefined = specificChatURI(chatData.chatId);
    if (chatData.chatId) {
        chatLink = chatData.chatId === chatData.chatId ? undefined : chatLink;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLeaveGroup = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const confirmLeave = window.confirm(`Are you sure that you want to leave chat: ${chatData.chatName}?`);
        if (confirmLeave) {
            await safeAPICall(tokens, fetchLeaveGroup, navigate, undefined, chatData.chatId);
            setIsMenuOpen(false);
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
                { chatData.isGroup ?
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={toggleMenu}
                            className="p-2 rounded-full text-white transition-all focus:outline-none"
                            title="Options"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" strokeWidth="2" 
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 text-white bg-white/20 border hover:bg-white/30 border-white/40 rounded-md shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={handleLeaveGroup}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="16" height="16" viewBox="0 0 24 24" 
                                        fill="none" stroke="currentColor" strokeWidth="2" 
                                        strokeLinecap="round" strokeLinejoin="round"
                                    >
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Leave from chat
                                </button>
                            </div>
                        )}
                    </div>
                : null }
            </div>            
        </FlowChatNavigationWrapper>
    );
};

export default FlowChat;