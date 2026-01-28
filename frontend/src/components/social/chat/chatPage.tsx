import React, { useState, useEffect, memo, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler.ts";

import ActiveChat from "./active_chats/activeChat.tsx";

import ChatsFlow from "./chatsFlow.tsx";
import { ChatConnectData, ChatConnectResponse, CustomSimpleResponse, PendingChatConnect, PendingChatConnectResponse } from "../../../fetching/responseDTOs.ts";
import { safeAPICall } from "../../../fetching/fetchUtils.ts";
import { fetchChatConnect, fetchIsChatPending, fetchPendingChatConnect } from "../../../fetching/fetchChatWS.ts";
import MakeNewChat from "./active_chats/makeNewChat.tsx";
import PendingChat from "./active_chats/pendingChat.tsx";
import CreateGroupChatModal from "./createGroupModal.tsx";
import LoadingIndicator from "../../base/centeredLoadingIndicator.tsx";

interface ChatPageProps {
    createNew: boolean,
}

export const ChatPage = (props: ChatPageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ activeChatData, setActiveChatData ] = useState<ChatConnectData | null>(null);
    const [ pendingChatData, setpendingChatData ] = useState<PendingChatConnect | null>(null);

    // This toggler allows to update current chat component on approving pending chat, prop drilled to PendingChatComponent
    const [ reRenderChats, setReRenderChats ] = useState(false);
    
    const { chatId } = useParams();

    const [ createGroupModal, setCreateGroupModal ] = useState(false);

    // For chat creation
    const { otherUserId } = useParams();

    useEffect(() => {
        if (props.createNew) {
            return;
        }

        const chatConnectFetcher = async () => {
            console.log("toggled rerender chats", reRenderChats)
            if (chatId && chatId.trim() !== "") {
                const chatPendingFlagResponse = await safeAPICall<CustomSimpleResponse<boolean>>(tokens, fetchIsChatPending, navigate, undefined, chatId);
                console.log("pending chat flag response: ", chatPendingFlagResponse)
                if (chatPendingFlagResponse.success) {
                    if (chatPendingFlagResponse.content === true) {
                        const pendingChatresponse = await safeAPICall<PendingChatConnectResponse>(tokens, fetchPendingChatConnect, navigate, undefined, chatId);
                        console.log("pending chat response: ", pendingChatresponse)
                        if (pendingChatresponse.success) {
                            setpendingChatData(pendingChatresponse.data);
                            setActiveChatData(null);
                            return;
                        }
                        setActiveChatData(null);
                    } else {
                        const approvedChatResponse = await safeAPICall<ChatConnectResponse>(tokens, fetchChatConnect, navigate, undefined, chatId);
                        if (approvedChatResponse.success) {
                            setActiveChatData(approvedChatResponse.data);
                            setpendingChatData(null);
                            return;
                        }
                        setActiveChatData(null);
                    }
                }
            }
        };

        chatConnectFetcher();
    }, [chatId, reRenderChats]);

    //@ts-ignore WILL BE FIXED IN THE NEST COMMIT
    const ActiveChatComponent = (props.createNew && otherUserId ? (<MakeNewChat otherUserId={otherUserId} />) : (chatId ? (activeChatData ? (<ActiveChat activeChatData={activeChatData} chatId={chatId} />) : (pendingChatData ? (<PendingChat chatData={pendingChatData} setReRenderOnApprove={setReRenderChats} chatId={chatId} changeMessageCallable={() => {}} />) : null)) : null));
    console.log("active chat component", ActiveChatComponent)
    return(
        <div className="flex w-full gap-16">
            <div className="w-1/3">
                { createGroupModal ? <div>
                    <CreateGroupChatModal showGroupCreationModelToggler={setCreateGroupModal} />
                </div> : null }
                <ChatsFlow showGroupCreationModelToggler={setCreateGroupModal} />
            </div>
            <div className="w-2/3">
                {ActiveChatComponent ??  (chatId ? <LoadingIndicator customMessage={undefined} /> : null)  }
            </div>
        </div>
    );
};

export default ChatPage;