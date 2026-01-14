import React, { useState, useEffect } from "react";
import MessageBar from "../chatComponents/messageBar";
import { fetchCreateDialogueChat, fetchDialoqueId  } from "../../../../fetching/fetchChatWS";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler";
import { safeAPICall } from "../../../../fetching/fetchUtils";
import { CustomSimpleResponse, SuccessfulResponse, ChatMessage } from "../../../../fetching/responseDTOs";
import { specificChatURI } from "../../../../consts";
import FlowMessage from "../chatComponents/message";

interface MakeNewChatProps {
    otherUserId: string
}

const MakeNewChat = (props: MakeNewChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ loading, setLoading ] = useState(true);
    const [ chatCreated, setChatCreated ] = useState(false);

    const [ firstMessage, setFirstMessage ] = useState<ChatMessage | null>(null)

    const sendMessageWrapper = async (message: string): Promise<void> => {
        if (!tokens.access || !tokens.refresh) {
            return;
        }

        await safeAPICall<SuccessfulResponse>(tokens, fetchCreateDialogueChat, navigate, undefined, props.otherUserId, message);
        setChatCreated(true);
    }

    useEffect(() => {
        const effectFetcher = async () => {
            setLoading(true);

            const response = await safeAPICall<CustomSimpleResponse<string | null>>(tokens, fetchDialoqueId, navigate, undefined, props.otherUserId)

            if (response.success && response.content) {
                navigate(specificChatURI(response.content));
                return;
            }
            setLoading(false);
        }
        effectFetcher()
    }, []);

    if (loading) {
        return (
            <p>Loading</p>
        );
    }

    return (
        <div>
            <div className="h-[calc(100vh-350px)] flex justify-center items-center text-2xl text-gray-200">
                { firstMessage ?
                <div>
                    { /* <FlowMessage /> */ } 
                </div>
                :
                <div className="flex flex-col text-center gap-4">
                    <p className="">Start a new Conversation!</p>
                    <p className="text-sm">After you send your first message, you will need to wait until your new chum approve this chat</p>                    
                </div>
                }
            </div>
            { chatCreated ? <p className="text-gray-200 text-center bg-white/10 px-4 py-2 border-white/30">Waiting for Approval</p> : <MessageBar sendMessageLocally={sendMessageWrapper} /> }
        </div>
    );
};

export default MakeNewChat;