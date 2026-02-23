import React, {useEffect, useState} from "react";

import {fetchLoadPost, fetchRecentActivity} from "../../../fetching/fetchSocial.ts";
import {
    LoadPostResponse,
    RecentActivity,
    RecentActivityArray,
    RecentActivityResponse, RecentActivityType
} from "../../../fetching/DTOs.ts";
import {validateGETResponse} from "../../../helpers/responseHandlers/getResponseHandlers.ts";
import { checkUnauthorizedResponse, retryUnauthorizedResponse, safeAPICallPublic } from "../../../fetching/fetchUtils.ts";
import {internalServerErrorURI, specificPostURI} from "../../../consts.ts";
import {getCookieTokens} from "../../../helpers/cookies/cookiesHandler.ts";
import {useNavigate} from "react-router";

const RecentActivityComponent = () => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);

    const [ recentActivity, setRecentActivity ] = useState<RecentActivityArray>();


    useEffect(() => {
    const effectFetcher = async () => {
            let response = await  safeAPICallPublic<RecentActivityResponse>(tokens, fetchRecentActivity, navigate, undefined );

            if (response.success) {
                setRecentActivity(response.data);
            }
        }
        // effectFetcher(); Currently backend recent activity feature is not working
    }, []);

    const defineActionURI = (rc: RecentActivity): string => {
        return specificPostURI(rc.postId)
    };

    const calculateElapsedTime = (date: Date): string => {
        return  ""
    };

    return (
        <div>
            <p className="text-xl text-white font-bold text-left m-6">Recent Activity:</p>
            <ul>
                {recentActivity?.map((rc, index) => {
                    return(
                            <li key={index} className="p-4">
                                <img src={rc.avatarURL} alt="Avatar" className="h-10 w-10 rounded-lg"></img>
                                <span className="text-white font-bold">{rc.message}</span>
                                <span className="mx-2 text-grey-700">{calculateElapsedTime(rc.date)}</span>
                            </li>
                    )
                }) ?? null}
            </ul>
        </div>
    );
};

export default RecentActivityComponent;
