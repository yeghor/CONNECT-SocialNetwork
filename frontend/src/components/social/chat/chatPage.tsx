import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./active_chats/activeChat.tsx";

import ChatList from "./chatList.tsx";
import {ChatConnectData, ChatConnectResponse, ChatResponse} from "../../../fetching/responseDTOs.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { fetchChatConnect } from "../../../fetching/chatWS.ts";
import MakeNewChat from "./active_chats/makeNewChat.tsx";

interface ChatPageProps {
    createNew: boolean,
}

export const ChatPage = (props: ChatPageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChatDataCredentials, setActiveChatDataCredentials ] = useState<ChatConnectData | null>(null); // Add generic type
    const { chatId } = useParams();

    // For chat creation
    const { userId } = useParams();

    useEffect(() => {
        const chatConnect = async () => {
            // Fetch more data to update lower level components data on changing chat
            if (chatId && chatId.trim() !== "") {
                // fetch chat data
                const response = await safeAPICall<ChatConnectResponse>(tokens, fetchChatConnect, navigate, undefined, chatId);
                if (response.success) {
                    setActiveChatDataCredentials(response.data);
                    return;
                }
                setActiveChatDataCredentials(null);
            }
        };
        chatConnect();
    }, [chatId]);

    const ActiveChatComponent = (props.createNew && userId ? (<MakeNewChat createNewOtherUserId={userId} />)  : (chatId ? (activeChatDataCredentials ? (<ActiveChat activeChatData={activeChatDataCredentials} chatId={chatId} />) : null) : null));

    return(
        <div className="columns-2 w-full">
            <div className="w-2/3">
                <ChatList />
            </div>
            <div className="w-full">
                {ActiveChatComponent ? ActiveChatComponent : <p className="text-2xl text-white">No Chat Selected</p>}
            </div>
        </div>
    );
};

export default ChatPage;