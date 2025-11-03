import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PostComments from "./post/postComments/postComments.tsx"

import { getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import { LoadPostResponseInterface, LoadPostResponse } from "../../fetching/responseDTOs.ts";
import { fetchLoadPost } from "../../fetching/fetchSocial.ts";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import { internalServerErrorURI } from "../../consts.ts";


const PostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ newComment, setNewComment ] = useState("");

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

    const sendComment = async () => {

    }

    if(!postData) {
        return null;
    }

    return (
        <div>
            <div className="w-full sm:w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
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
                        console.log(url);
                        return (
                            <div className="relative block aspect-square cursor-pointer" key={index}>
                                <img className="w-full h-full object-cover rounded-lg" src={url} alt="Post image"/>
                            </div>
                        )
                        })
                    }
                </div>
            </div>
            <div className="w-full sm:w-[900px] mx-auto p-4 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12 text-white">
                <div className="mb-6 space-y-3">
                    <div className="text-xl font-semibold">Create a comment</div>

                    <input
                        type="text"
                        placeholder="Title..."
                        className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                    />

                    <textarea
                        placeholder="Write your comment..."
                        className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                    ></textarea>

                    <div className="flex items-center justify-between">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:hover:bg-white/20 file:cursor-pointer"
                        />
                        <span className="text-sm text-white/50">Up to 3 images</span>
                    </div>

                    <button
                        className="w-full py-2 mt-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition border border-white/20"
                        onClick={() => sendComment()}
                    >
                        Post Comment
                    </button>
                </div>
            </div>
            <div className="w-full sm:w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                <div className="font-bold text-2xl text-white">Comments:</div>
                <PostComments originalPostData={postData} />
            </div>
        </div>
    );
}

export default PostPage