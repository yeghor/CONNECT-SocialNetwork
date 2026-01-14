import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./active_chats/activeChat.tsx";

import ChatsFlow from "./chatsFlow.tsx";
import { ChatConnectData, ChatConnectResponse, Chat } from "../../../fetching/responseDTOs.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { fetchChatConnect } from "../../../fetching/fetchChatWS.ts";
import MakeNewChat from "./active_chats/makeNewChat.tsx";

interface ChatPageProps {
    createNew: boolean,
}

export const ChatPage = (props: ChatPageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChatData, setActiveChatData ] = useState<ChatConnectData | null>(null);
    const { chatId } = useParams();

    // For chat creation
    const { otherUserId } = useParams();

    useEffect(() => {
        if (props.createNew) {
            return;
        }

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

    const ActiveChatComponent = (props.createNew && otherUserId ? (<MakeNewChat otherUserId={otherUserId} />)  : (chatId ? (activeChatData ? (<ActiveChat activeChatData={activeChatData} chatId={chatId} />) : null) : null));

    return(
        <div className="flex w-full gap-16">
            <div className="w-1/3">
                <ChatsFlow />
            </div>
            <div className="w-2/3">
                {ActiveChatComponent ? ActiveChatComponent : null}
            </div>
        </div>
    );
};

export default ChatPage;