import React, { useState, useEffect } from "react"
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler";
import { useNavigate } from "react-router";
import { PendingChatConnect } from "../../../../fetching/responseDTOs";

interface PendingChatProps {
    chatData: PendingChatConnect
}

const PendingChat = (props: PendingChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    return (
        <div>
            Hello World!
        </div>
    );
};

export default PendingChat;