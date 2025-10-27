import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import { LoadPostResponseInterface, LoadPostResponse } from "../../fetching/responseDTOs.ts";
import { fetchLoadPost } from "../../fetching/fetchSocial.ts";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import { internalServerErrorURI } from "../../consts.ts";

import CommentsFlow from "./post/postComments/topCommentsFlow.tsx";

const PostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ postData, setPostData ] = useState<LoadPostResponseInterface | undefined>(undefined);

    const postFetcher = async (): Promise<void> => {
        // If statement to prevent TS errors. Cause if no tokens - getCookiesOrRedirect will redirect user to auth page
        if(!(tokens.access && tokens.refresh && postId)) { return; }

        try {
            let response = await fetchLoadPost(tokens.access, postId);

            if (!validateResponse(response, undefined, navigate)) {
                return;
            }

            if (checkUnauthorizedResponse(response)) {
                const retried = await retryUnauthorizedResponse<LoadPostResponse>(fetchLoadPost, tokens.refresh, navigate, undefined, postId);
                if (!retried) {
                    return;
                }
                response = retried;
            }

            if (response.success) {
                setPostData(response.data);
            }

        } catch (err) {
            console.error(err);
            navigate(internalServerErrorURI);
        }
    };

    useEffect(() => {
        postFetcher();
    }, [])

    console.log(postData);

    if(!postData) {
        return null;
    }

    return (
        <div className="w-full sm:w-[900px] mx-auto p-6 bg-white/30 backdrop-blur rounded-2xl shadow-sm m-12">
        <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">Author
                </div>
                <div>
                    <div className="font-semibold text-white">{postData.owner.username}</div>
                    <div className="text-xs text-gray-200">
                        <span>{postData.published.toISOString().split("T")[0]}</span>
                        <span className="mx-2">{`${postData.published.getHours()}:${postData.published.getMinutes()}`}</span>
                    </div>
                </div>
            </div>

            <div className="text-white leading-relaxed mb-4 font-bold">{postData.title}</div>

            <div className="text-white leading-relaxed mb-4">{postData.text}</div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                { postData.picturesURLs.map((url: string, index: number) => {
                    return (
                        <div className="relative block aspect-square rounded-lg border border-gray-200 bg-white/50 overflow-hidden cursor-pointer">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Add Image</div>
                            <img className="w-full h-full object-cover hidden" src={url} alt="Post image"/>
                        </div>
                    )
                    })
                }
            </div>
            <div className="flex items-center justify-start px-72 py-8 mb-6">
                <CommentsFlow originalPostData={postData}/>
            </div>

        </div>
    );
}

export default PostPage