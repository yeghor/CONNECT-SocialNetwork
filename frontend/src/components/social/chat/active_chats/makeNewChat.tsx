import React, { useState } from "react";
import MessageBar from "../chatComponents/messageBar";
import { fetchCreateDialogueChat } from "../../../../fetching/fetchChatWS";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler";
import { safeAPICall } from "../../../../fetching/fetchUtils";
import { SuccessfulResponse } from "../../../../fetching/responseDTOs";

interface MakeNewChatProps {
    createNewOtherUserId: string
}

const MakeNewChat = (props: MakeNewChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const sendMessageWrapper = async (message: string): Promise<void> => {
        // Guard for typescript. Because if some token does not exist, the app will navigate user to login page
        if (!tokens.access || !tokens.refresh) {
            return;
        }

        await safeAPICall<SuccessfulResponse>(tokens, fetchCreateDialogueChat, navigate, undefined, props.createNewOtherUserId, message);
    }

    return (
        <div>
            <p className="text-2xl text-white">Create chat</p>
            <MessageBar sendMessageLocally={sendMessageWrapper} />
        </div>
    );
};

export default MakeNewChat;