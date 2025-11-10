import React, {useEffect, useState} from "react";

import {fetchLoadPost, fetchRecentActivity} from "../../../fetching/fetchSocial.ts";
import {
    LoadPostResponse,
    RecentActivity,
    RecentActivityArray,
    RecentActivityResponse, RecentActivityType
} from "../../../fetching/responseDTOs.ts";
import {validateGETResponse} from "../../../helpers/responseHandlers/getResponseHandlers.ts";
import { checkUnauthorizedResponse, retryUnauthorizedResponse } from "../../../fetching/fetchUtils.ts";
import {internalServerErrorURI, specificPostURI} from "../../../consts.ts";
import {getCookiesOrRedirect} from "../../../helpers/cookies/cookiesHandler.ts";
import {useNavigate} from "react-router";

const RecentActivityComponent = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ recentActivity, setRecentActivity ] = useState<RecentActivityArray>();


    useEffect(() => {
        const fetched = async () => {
            // TS Guard
            if(!tokens.access || !tokens.refresh) { return; }
            try {
                let response = await fetchRecentActivity(tokens.access);

                if (!validateGETResponse(response, undefined, navigate)) {
                    return;
                }

                if (checkUnauthorizedResponse(response)) {
                    const retried = await retryUnauthorizedResponse<RecentActivityResponse>(fetchRecentActivity, tokens.refresh, navigate, undefined);
                    if (!retried) {
                        return;
                    }
                    response = retried;
                }

                if (response.success) {
                    setRecentActivity(response.data);
                }

            } catch (err) {
                console.error(err);
                navigate(internalServerErrorURI);
            }
        }
    }, [])

    const defineActionURI = (rc: RecentActivity): string => {
        return specificPostURI(rc.postId)
    }

    const calculateElapsedTime = (date: Date): string => {
        return  ""
    }

    return (
        <div>
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
