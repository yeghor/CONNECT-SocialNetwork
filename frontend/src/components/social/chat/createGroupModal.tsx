import React, { useState, useEffect, useRef } from "react";
import { fetchMyFriends } from "../../../fetching/fetchSocial";
import { safeAPICallPrivate } from "../../../fetching/fetchUtils";
import { CustomSimpleResponse, ShortUserProfile, ShortUserProfilesResponse, SuccessfulResponse } from "../../../fetching/DTOs";
import { useNavigate } from "react-router";
import { getCookieTokens } from "../../../helpers/cookies/cookiesHandler";
import FlowUser from "../post/flowUser";
import { fetchCreateGroupChat } from "../../../fetching/fetchChatWS";
import { specificChatURI } from "../../../consts";


const CreateGroupChatModal = (props: { showGroupCreationModelToggler: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(navigate);

    const modalRef = useRef<HTMLDivElement>(null);

    const [ friendsData, setFriendsData ] = useState<ShortUserProfile[]>([]);
    const [ participantsIds, setParticipantsIds ] = useState<string[]>([]);
    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);

    const [ searchString, setSearchString ] = useState("");
    const toFilter = Boolean(searchString);


    const createGroup = async () => {
        const response = await safeAPICallPrivate<CustomSimpleResponse<string>>(tokens, fetchCreateGroupChat, navigate, setWarningMessage, participantsIds);

        if (response.success) {
            props.showGroupCreationModelToggler(false);
            navigate(specificChatURI(response.content))
        }
    };

    const addOrDeleteParticipant = async (userId: string, action: "add" | "delete") => {
        switch (action) {
            case "add":
                setParticipantsIds((prevState) => [ userId, ...prevState ])
                break;
            case "delete":
                setParticipantsIds((prevState) => {
                    return prevState.filter((id) => {
                        return !(id === userId);
                    });
                });
        }
    };

    useEffect(() => {
        const friendsFetcher = async()  => {
            const response = await safeAPICallPrivate<ShortUserProfilesResponse>(tokens, fetchMyFriends, navigate, undefined);

            if (response.success) {
                setFriendsData(response.data);
            }
        };
        friendsFetcher();
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                props.showGroupCreationModelToggler(false);
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const friendsToShow = toFilter ? friendsData.filter((friend) => {
        return friend.username.toLocaleLowerCase().match(new RegExp(searchString.toLowerCase()));
    }) : friendsData

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 text-white transition-all">
            <div ref={modalRef} className="relative bg-white/10 w-full max-w-2xl rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden h-[600px] flex flex-col">
                <div className="flex justify-between p-6">
                    <h3 className="text-xl font-semibold">Create Group</h3>
                    <button 
                        onClick={() => props.showGroupCreationModelToggler(false)}
                        className="text-gray-200 hover:text-white text-3xl"
                    >
                        &times;
                    </button>
                </div>


                <div className="mx-6 mb-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => setSearchString(e.target.value)}
                        className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 transition-all text-white"
                    />
                </div>

                {warningMessage && <p className="text-red-400 px-6 mb-2 text-sm">{warningMessage}</p>}

                <div className="p-6 space-y-4 overflow-y-auto flex-1 border-t border-b border-white/10">
                    {friendsToShow.map((friend) => {
                        const idIncluded = participantsIds.includes(friend.userId);
                        return (
                            <div key={friend.userId} className="flex justify-between items-center">
                                <FlowUser userData={friend} />
                                <button 
                                    onClick={() => addOrDeleteParticipant(friend.userId, idIncluded ? "delete" : "add")} 
                                    className={`p-2 w-32 rounded-full ${idIncluded ? "bg-white/20" : "bg-white/10 hover:scale-105 hover:bg-white/20"} transition-all`}
                                >
                                    {idIncluded ? "Remove" : "Add"}
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-3 p-6">
                    <button 
                        onClick={() => createGroup()}
                        className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        Create Group
                    </button>
                    <button 
                        onClick={() => props.showGroupCreationModelToggler(false)}
                        className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupChatModal;