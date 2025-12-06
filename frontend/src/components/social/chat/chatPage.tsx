import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./activeChat.tsx";

import ChatList from "./chatList.tsx";
import {ChatResponse} from "../../../fetching/responseDTOs.ts";

export const ChatPage = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChat, setActiveChat ] = useState({}); // Add generic type

    const { chatId } = useParams();

    useEffect(() => {
        // Fetch more data to update lower level components data on changing chat
        if (chatId && chatId.trim() !== "") {
            // fetch chat data
            const response = {success: true};
            if (response.success) {
                setActiveChat({chatData: {}});
            }
            setActiveChat({});
        }
    }, [chatId]);

    return(
        <div className="columns-2 w-full">
            <div className="w-1/3">
                <ChatList />
            </div>
            <div className="w-2/3">
                <ActiveChat activeChatData={activeChat} />
            </div>
        </div>
    );
};

export default ChatPage;