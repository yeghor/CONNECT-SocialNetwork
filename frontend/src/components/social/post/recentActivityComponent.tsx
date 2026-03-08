import React, { useEffect, useState } from "react";

import { fetchRecentActivity } from "../../../fetching/fetchSocial.ts";
import {
    RecentActivity,
    RecentActivityArray,
    RecentActivityResponse
} from "../../../fetching/DTOs.ts";
import { safeAPICallPublic } from "../../../fetching/fetchUtils.ts";
import { specificPostURI } from "../../../consts.ts";
import { getCookieTokens } from "../../../helpers/cookies/cookiesHandler.ts";
import { useNavigate } from "react-router";

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
        effectFetcher();
    }, []);

    const defineActionURI = (rc: RecentActivity): string => {
        return specificPostURI(rc.postId)
    };

    const calculateElapsedTime = (date: Date): string => {
        return new Date().toString()
    };

    return (
        <div>
            <p className="text-xl text-white font-bold text-left m-6">Recent Activity:</p>
            <ul>
                {recentActivity?.map((rc, index) => {
                    return(
                            <li key={index} className="p-4">
                                <img 
                                    src={rc.avatarURL || "/uknown-user-image.jpg"} 
                                    alt="avatar" 
                                    className="h-10 w-auto rounded-full object-cover border border-white/20 group-hover:scale-110 transition-transform"
                                />
                                <span className="text-white">{rc.message}</span>
                                <span className="mx-2 text-grey-700">{calculateElapsedTime(rc.date)}</span>
                            </li>
                    )
                }) ?? null}
            </ul>
        </div>
    );
};

export default RecentActivityComponent;
