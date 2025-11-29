import React, { useState, useEffect } from "react"

import { UserProfileResponse, UserProfile } from "../../fetching/responseDTOs.ts";
import { MyProfilePage, ProfilePage } from "./profilePage.tsx";
import { safeAPICall } from "../../fetching/fetchUtils.ts";
import { getCookiesOrRedirect } from "../../helpers/cookies/cookiesHandler.ts";
import { useNavigate } from "react-router";
import { fetchSpecificUserProfile } from "../../fetching/fetchSocial.ts";
import { useParams } from "react-router-dom";

const ProfilePageWrapper = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);
    const { userId } = useParams();

    const [ userProfileData, setUserProfileData ] = useState<UserProfile | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const profileFetcher = async () => {
            setLoading(true);
            const profileData = await safeAPICall<UserProfileResponse>(tokens, fetchSpecificUserProfile, navigate, undefined, userId)
            if (profileData.success) {
                setUserProfileData(profileData.data);
            }
            setLoading(false);
        }
        profileFetcher();
    }, [])

    if (loading || !userProfileData) {
        return null
    }
    console.log(userProfileData.me);

    if (!userProfileData.me) {
        return (<MyProfilePage userData={userProfileData} me={userProfileData.me} />)
    }
    return (<ProfilePage userData={userProfileData} me={userProfileData.me} />)
};

export default ProfilePageWrapper;