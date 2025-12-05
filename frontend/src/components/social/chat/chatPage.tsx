import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ActiveChat from "./activeChat.tsx";
import {getCookiesOrRedirect} from "../../../helpers/cookies/cookiesHandler.ts";
import ChatList from "./chatList.tsx";

export const ChatPage = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const { chatId } = useParams();

    useEffect(() => {
        // Fetch more data to update lower level components data on changing chat
    }, [chatId]);

    return(
        <div className="columns-2 w-full">
            <div className="w-1/3">
                <ChatList />
            </div>
            <div className="w-2/3">
                <ActiveChat />
            </div>

        </div>
    );
};

export default ChatPage;