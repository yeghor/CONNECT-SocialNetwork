import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./activeChat.tsx";

import ChatList from "./chatList.tsx";
import {ChatConnectData, ChatConnectResponse, ChatResponse} from "../../../fetching/responseDTOs.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { fetchChatConnect } from "../../../fetching/chatWS.ts";
import MakeNewChat from "./makeNewChat.tsx";

interface ChatPageProps {
    createNew: boolean,
    createNewOtherUserId: string | undefined
}

export const ChatPage = (props: ChatPageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChat, setActiveChat ] = useState<ChatConnectData | null>(); // Add generic type
    const { chatId } = useParams();

    useEffect(() => {
        const chatConnect = async () => {
            // Fetch more data to update lower level components data on changing chat
            if (chatId && chatId.trim() !== "") {
                // fetch chat data
                const response = await safeAPICall<ChatConnectResponse>(tokens, fetchChatConnect, navigate, undefined, chatId);
                if (response.success) {
                    setActiveChat(response.data);
                    return;
                }
                setActiveChat(null);
            }
        };
        chatConnect();
    }, [chatId]);

    const ActiveChatComponent = (props.createNew && props.createNewOtherUserId ? (<MakeNewChat createNewOtherUserId={props.createNewOtherUserId} />)  : (activeChat ? (<ActiveChat activeChatData={activeChat} />) : null));

    return(
        <div className="columns-2 w-full">
            <div className="w-1/3">
                <ChatList />
            </div>
            <div className="w-2/3">
                {ActiveChatComponent}
            </div>
        </div>
    );
};

export default ChatPage;