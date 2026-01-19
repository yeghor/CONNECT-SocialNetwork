import React, { useState, useEffect } from "react"
import { Link } from "react-router";
import { getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler";
import { useNavigate } from "react-router";
import { PendingChatConnect, SuccessfulResponse } from "../../../../fetching/responseDTOs";
import FlowMessage from "../chatComponents/message";
import { safeAPICall } from "../../../../fetching/fetchUtils";
import { fetchApproveChat, fetchDisapproveChat } from "../../../../fetching/fetchChatWS";
import { chatsURI, specificUserProfileURI } from "../../../../consts";

interface PendingChatProps {
    chatId: string;
    chatData: PendingChatConnect;
    setReRenderOnApprove: React.Dispatch<React.SetStateAction<boolean>>;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void;
}

const PendingChat = (props: PendingChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const approveChat = async (): Promise<void> => {
        const response = await safeAPICall<SuccessfulResponse>(tokens, fetchApproveChat, navigate, undefined, props.chatId);

        if (response.success) {
            props.setReRenderOnApprove((prevState) => { console.log("oldstate, ", prevState, "newstate", !prevState); return !prevState; });
        }
    };

    const disapproveChat = async (): Promise<void> => {
        const response = await safeAPICall<SuccessfulResponse>(tokens, fetchDisapproveChat, navigate, undefined, props.chatId);
        
        if (response.success) {
            navigate(`/${chatsURI}`);
        }
    };

    return (
        <div className="h-[calc(100vh-300px)] mx-4 flex flex-col">
            <div className="flex flex-col justify-center items-center grow wy-auto gap-4">
                <p className="text-start text-sm text-gray-400">Tip: Click to see profile</p>
                <Link to={specificUserProfileURI(props.chatData.initiatorUser.userId)} className="flex flex-col justify-center items-center hover:border-2 border-white/30 rounded-xl transition-all p-2">
                    <img src={props.chatData.initiatorUser.avatarURL ?? "/uknown-user-image.jpg"} className="w-32 h-32 rounded-full" />
                    <div className="text-center">
                        <p className="font-bold text-white">{props.chatData.initiatorUser.username}</p>
                        <p className="text-gray-200">Wants to start a chat with you!</p>
                    </div>
                </Link>
            </div>
            <div className="flex-col gap-4">
                <div className="flex items-end">
                    <FlowMessage 
                        messageData={props.chatData.message} 
                        isSending={false} 
                        ownerData={props.chatData.initiatorUser} 
                        changeMessageCallable={props.changeMessageCallable} 
                        deleteMessageCallable={props.deleteMessageCallable} 
                    />
                </div>

                <div className="flex gap-3 w-full">
                    <button 
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-200 text-[11px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl border border-red-500/30 transition-all active:scale-95" 
                        onClick={ async () => await disapproveChat()}
                    >
                        Disapprove
                    </button>
                    
                    <button 
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[11px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl border border-white/20 transition-all" 
                        onClick={ async () => await approveChat()}
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingChat;