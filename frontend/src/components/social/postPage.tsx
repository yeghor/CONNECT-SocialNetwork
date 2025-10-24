import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import {LoadPostResponseInterface} from "../../fetching/responseDTOs.ts";
import {fetchLoadPost} from "../../fetching/fetchSocial.ts";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import {internalServerErrorURI} from "../../consts.ts";


const PostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ postData, setPostData ] = useState<LoadPostResponseInterface | undefined>(undefined);

    const postFetcher = async (): Promise<void> => {
        // If statement to prevent TS errors. Cause if no tokens - getCookiesOrRedirect will redirect user to auth page
        if(tokens.access && tokens.refresh && postId) {
                try {
                const response = await fetchLoadPost(tokens.access, postId);

                if(!validateResponse(response, undefined, navigate)) {
                    return;
                }

                if(checkUnauthorizedResponse(response)) {
                    const retriedResponse = await retryUnauthorizedResponse(fetchLoadPost, tokens.refresh, navigate, undefined, postId);
                    if(!retriedResponse) {
                        return;
                    }
                }

                if(response.success) {
                    setPostData(response.data);
                }
            }
        catch (err) {
            console.error(err);
            navigate(internalServerErrorURI);
        }}
    }

    useEffect(() => {
        postFetcher();
    }, [])

    return (
        <div className="max-w-xl mx-auto p-6 bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                    AU
                </div>
                <div>
                    <div className="font-semibold text-gray-900">Author Name</div>
                    <div className="text-xs text-gray-500">Oct 24, 2025</div>
                </div>
            </div>

            <div className="text-gray-800 leading-relaxed mb 4">
                This is the body of the post. You can write multiple paragraphs here. The design stays white and clean,
                without any dark themes.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                    className="relative block aspect-square rounded-lg border border-gray-200 bg-white/50 overflow-hidden cursor-pointer">
                    <input type="file" accept="image/*" className="sr-only image-input"/>
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Add Image
                    </div>
                    <img className="w-full h-full object-cover hidden"/>
                </label>

                <label
                    className="relative block aspect-square rounded-lg border border-gray-200 bg-white/50 overflow-hidden cursor-pointer">
                    <input type="file" accept="image/*" className="sr-only image-input"/>
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Add Image
                    </div>
                    <img className="w-full h-full object-cover hidden"/>
                </label>

                <label
                    className="relative block aspect-square rounded-lg border border-gray-200 bg-white/50 overflow-hidden cursor-pointer">
                    <input type="file" accept="image/*" className="sr-only image-input"/>
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Add Image
                    </div>
                    <img className="w-full h-full object-cover hidden"/>
                </label>
            </div>
        </div>
    );
}

export default PostPage