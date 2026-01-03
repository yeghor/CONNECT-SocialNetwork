import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./active_chats/activeChat.tsx";

import ChatList from "./chatList.tsx";
import {ChatConnectData, ChatConnectResponse, ChatResponse} from "../../../fetching/responseDTOs.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { fetchChatConnect } from "../../../fetching/fetchChatWS.ts";
import MakeNewChat from "./active_chats/makeNewChat.tsx";

interface ChatPageProps {
    createNew: boolean,
}

export const ChatPage = (props: ChatPageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChatData, setActiveChatData ] = useState<ChatConnectData | null>(null); // Add generic type
    const { chatId } = useParams();

    // For chat creation
    const { userId } = useParams();

    useEffect(() => {
        const chatConnect = async () => {
            // Fetch more data to update lower level components data on changing chat
            if (chatId && chatId.trim() !== "") {
                const response = await safeAPICall<ChatConnectResponse>(tokens, fetchChatConnect, navigate, undefined, chatId);
                if (response.success) {
                    setActiveChatData(response.data);
                    return;
                }
                setActiveChatData(null);
            }
        };
        chatConnect();
    }, [chatId]);

    const ActiveChatComponent = (props.createNew && userId ? (<MakeNewChat createNewOtherUserId={userId} />)  : (chatId ? (activeChatData ? (<ActiveChat activeChatData={activeChatData} chatId={chatId} />) : null) : null));

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