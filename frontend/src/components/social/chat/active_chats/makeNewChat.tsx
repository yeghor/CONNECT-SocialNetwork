import React, { useState, useEffect } from "react";
import MessageBar from "../chatComponents/messageBar";
import { fetchCreateDialogueChat, fetchDialoqueId  } from "../../../../fetching/fetchChatWS";
import { resolvePath, useNavigate } from "react-router";
import { getCookieTokens } from "../../../../helpers/cookies/cookiesHandler";
import { safeAPICallPrivate } from "../../../../fetching/fetchUtils";
import { CustomSimpleResponse, SuccessfulResponse, ChatMessage } from "../../../../fetching/DTOs/";
import { specificChatURI } from "../../../../consts";
import FlowMessage from "../chatComponents/message";
import LoadingIndicator from "../../../base/centeredLoadingIndicator";

interface MakeNewChatProps {
    otherUserId: string
}

const MakeNewChat = (props: MakeNewChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(navigate);

    const [ loading, setLoading ] = useState(true);
    const [ chatCreated, setChatCreated ] = useState(false);

    const [ firstMessage, setFirstMessage ] = useState<ChatMessage | null>(null)

    const sendMessageWrapper = async (message: string): Promise<void> => {
        if (!tokens.access || !tokens.refresh) {
            return;
        }

        await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchCreateDialogueChat, navigate, undefined, props.otherUserId, message);
        setChatCreated(true);
    }
    useEffect(() => {
        const asyncfetcher = async () => {
            setLoading(true)
            const response = await safeAPICallPrivate<CustomSimpleResponse<string | null>>(tokens, fetchDialoqueId, navigate, undefined, props.otherUserId)
            if (response.success && response.content) {
                navigate(specificChatURI(response.content));
                return;
            }
            setLoading(false);
        }
        asyncfetcher()
    }, []);

    if (loading) {
        return ( <LoadingIndicator customMessage={undefined} /> );
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