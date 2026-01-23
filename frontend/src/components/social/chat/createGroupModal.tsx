import React, { useState, useEffect } from "react";
import { fetchMyFriends } from "../../../fetching/fetchSocial";
import { safeAPICall } from "../../../fetching/fetchUtils";
import { ShortUserProfile, ShortUserProfilesResponse } from "../../../fetching/responseDTOs";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler";
import FlowUser from "../post/flowUser";


const CreateGroupChatModal = (props: { showGroupCreationModelToggler: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ friendsData, setFriendsData ] = useState<ShortUserProfile[]>([]);
    const [ participantsIds, setParticipantsIds ] = useState<string[]>([]);
    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);

    const [ searchString, setSearchString ] = useState("");

    const searchFriends = () => {

    };

    const createGroup = async () => {

    };

    useEffect(() => {
        const friendsFetcher = async()  => {
            const response = await safeAPICall<ShortUserProfilesResponse>(tokens, fetchMyFriends, navigate, undefined);

            if (response.success) {
                setFriendsData(response.data);
            }
        };
        friendsFetcher();
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 text-white">
            <div className="relative bg-white/10 w-full max-w-2xl rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between p-6">
                    <h3 className="text-xl font-semibold">Create Group</h3>
                    <button 
                        onClick={() => props.showGroupCreationModelToggler(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <p className="text-red-600 px-6">{warningMessage}</p>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    { friendsData.map((friend) => {
                        return (
                            <div className="flex justify-between items-center">
                                <FlowUser userData={friend} />
                                <input type="checkbox" className="w-8 h-8"></input>
                            </div>
                        )
                    }) }
                </div>

                <div className="flex items-center gap-3 p-6">
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Create Group
                    </button>
                    <button 
                        onClick={() => { props.showGroupCreationModelToggler(false) }}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupChatModal;