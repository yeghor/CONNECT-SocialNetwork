import React, { useState, useEffect } from "react";
import MessageBar from "../chatComponents/messageBar";
import { fetchCreateDialogueChat, fetchDialoqueId  } from "../../../../fetching/fetchChatWS";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler";
import { safeAPICall } from "../../../../fetching/fetchUtils";
import { StringResponse, SuccessfulResponse } from "../../../../fetching/responseDTOs";
import { specificChatURI } from "../../../../consts";

interface MakeNewChatProps {
    otherUserId: string
}

const MakeNewChat = (props: MakeNewChatProps) => {
    console.log("make new chat rendering")

    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);
    const [ loading, setLoading ] = useState(true);

    const sendMessageWrapper = async (message: string): Promise<void> => {
        if (!tokens.access || !tokens.refresh) {
            return;
        }

        await safeAPICall<SuccessfulResponse>(tokens, fetchCreateDialogueChat, navigate, undefined, props.otherUserId, message);
    }

    useEffect(() => {
        const effectFetcher = async () => {
            setLoading(true);

            const response = await safeAPICall<StringResponse>(tokens, fetchDialoqueId, navigate, undefined, props.otherUserId)

            if (response.success && response.string) {
                navigate(specificChatURI(response.string));
                return;
            }
            setLoading(false);
        }
        effectFetcher()
    }, []);

    if (loading) {
        return (null);
    }

    return (
        <div>
            <p className="text-2xl text-white">Create chat</p>
            <MessageBar sendMessageLocally={sendMessageWrapper} />
        </div>
    );
};

export default MakeNewChat;