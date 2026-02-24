import React, { useState, useEffect } from "react"
import { Link } from "react-router";
import { getCookieTokens } from "../../../../helpers/cookies/cookiesHandler";
import { useNavigate } from "react-router";
import { PendingChatConnect, SuccessfulResponse } from "../../../../fetching/DTOs";
import FlowMessage from "../chatComponents/message";
import { safeAPICallPrivate } from "../../../../fetching/fetchUtils";
import { fetchApproveChat, fetchChatInitiatedByMe, fetchDisapproveChat } from "../../../../fetching/fetchChatWS";
import { chatsURI, specificUserProfileURI } from "../../../../consts";
import { CustomSimpleResponse } from "../../../../fetching/DTOs";

interface PendingChatProps {
    chatId: string;
    chatData: PendingChatConnect;
    setReRenderOnApprove: React.Dispatch<React.SetStateAction<boolean>>;
    changeMessageCallable: (message: string, messageId: string) => void;
    deleteMessageCallable: (messageId: string) => void;
}

const PendingChat = (props: PendingChatProps) => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(navigate);
    const [ initiatedByMe, setInitiatedByMe ] = useState(true);
    const [ showComponent, setShowComponent ] = useState(false)

    const approveChat = async (): Promise<void> => {
        const response = await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchApproveChat, navigate, undefined, props.chatId);

        if (response.success) {
            props.setReRenderOnApprove((prevState) => { console.log("oldstate, ", prevState, "newstate", !prevState); return !prevState; });
        }
    };

    const disapproveChat = async (): Promise<void> => {
        const response = await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchDisapproveChat, navigate, undefined, props.chatId);
        
        if (response.success) {
            navigate(`/${chatsURI}`);
        }
    };

    useEffect(() => {
        const asyncFetcher = async () => {
            const response = await safeAPICallPrivate<CustomSimpleResponse<boolean>>(tokens, fetchChatInitiatedByMe, navigate, undefined, props.chatId);
            if (response.success) {
                setInitiatedByMe(response.content);
                setShowComponent(true);
            }            
        };
        asyncFetcher();
    }, [])

    if (!showComponent) {
        return null;
    }

    return (
        <div className="h-[calc(100vh-300px)] mx-4 flex flex-col">
            <div className="flex-grow flex flex-col justify-center">
                { initiatedByMe ?
                    <div>
                        <div className="flex flex-col justify-center items-center grow wy-auto gap-4">
                            <p className="text-start text-sm text-gray-400">Your chat request is pending</p>
                            
                            <Link to={specificUserProfileURI(props.chatData.initiatorUser.userId)} className="flex flex-col justify-center items-center hover:border-2 border-white/30 rounded-xl transition-all p-2">
                                <img 
                                    src={props.chatData.initiatorUser.avatarURL ?? "/uknown-user-image.jpg"} 
                                    className="w-32 h-32 rounded-full border-2 border-blue-500/50" 
                                />
                                <div className="text-center mt-2">
                                    <p className="font-bold text-white">{props.chatData.initiatorUser.username} (You)</p>
                                    <p className="text-gray-400 text-sm">Waiting for response...</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                    :
                    <div>
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
                    </div>}
                </div>

                <div className="flex-col gap-4">
                    <div className="flex items-end">
                        <FlowMessage 
                            messageData={props.chatData.message} 
                            isSending={false} 
                            isGroup={false}
                            showChangeDelete={false}
                            ownerData={props.chatData.initiatorUser} 
                            changeMessageCallable={props.changeMessageCallable} 
                            deleteMessageCallable={props.deleteMessageCallable} 
                        />
                    </div>
                </div>

                { initiatedByMe ? <p className="text-gray-200 text-center bg-white/10 px-4 py-2 border-white/30 rounded-xl">Waiting for Approval</p> : <div className="flex gap-3 w-full">
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
                </div> }
            </div>  
    );
};

export default PendingChat;