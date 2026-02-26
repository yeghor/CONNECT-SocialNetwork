import React, { useState, useEffect } from "react"

import { UserProfileResponse, UserProfile } from "../../../fetching/DTOs.ts";
import { MyProfilePage, ProfilePage } from ".././profilePage.tsx";
import { safeAPICallPrivate, safeAPICallPublic } from "../../../fetching/fetchUtils";
import { getCookieTokens } from "../../../helpers/cookies/cookiesHandler.ts";
import { useNavigate } from "react-router";
import { fetchMyProfile, fetchSpecificUserProfile } from "../../../fetching/fetchSocial";
import { useParams } from "react-router-dom";
import { loginURI } from "../../../consts.ts";

const ProfilePageWrapper = () => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);
    const { userId } = useParams();

    const [ userProfileData, setUserProfileData ] = useState<UserProfile | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const profileFetcher = async () => {
            if (!tokens.refresh) {
                navigate(loginURI);
                return;
            }

            setLoading(true);
            
            let fetchFunc: CallableFunction = fetchSpecificUserProfile;

            if (userId === "" || !userId) {
                fetchFunc = fetchMyProfile;
            }

            const profileData = await safeAPICallPublic<UserProfileResponse>(tokens, fetchFunc, navigate, undefined, userId ? userId : null)
            if (profileData.success) {
                setUserProfileData(profileData.data);
            }
            setLoading(false);
        }
        profileFetcher();
    }, [])

    if (loading || !userProfileData) {
        // Setting h to screen size just to prevent footer placed on the top of page while page is loading
        return (
            <div className="h-screen"></div>
        )
    }

    if (!userProfileData.me) {
        return (<MyProfilePage userData={userProfileData} me={userProfileData.me} />)
    }
    return (<ProfilePage userData={userProfileData} me={userProfileData.me} />)
};

export default ProfilePageWrapper;