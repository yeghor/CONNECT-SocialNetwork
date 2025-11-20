import React, { useEffect, useState } from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";

import PostComments from "./post/postComments/postComments.tsx"

import { getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import {LoadPostResponseInterface, LoadPostResponse, SuccessfulResponse} from "../../fetching/responseDTOs.ts";
import {fetchLikePost, fetchLoadPost, fetchUnlikePost} from "../../fetching/fetchSocial.ts";

import { safeAPICall } from "../../fetching/fetchUtils.ts";
import MakePost from "./post/makePost.tsx";
import {maxRequestsQueueLength, specificPostURI, tooMuchActivityMessage} from "../../consts.ts";

const PostPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ liked, toggleLikes ] = useState(false);

    // Store () => fetchLike/UnlinePost(...args)
    const [ likeRequestQueue, setLikeRequestQueue ] = useState<CallableFunction[]>([]);

    const [ postData, setPostData ] = useState<LoadPostResponseInterface | undefined>(undefined);

    const postFetcher = async (): Promise<void> => {
        // If statement to prevent TS errors. Cause if no tokens - getCookiesOrRedirect will redirect user to auth page
        if(!(tokens.access && tokens.refresh && postId)) { return; }

            const response = await safeAPICall<LoadPostResponse>(
                tokens,
                fetchLoadPost,
                navigate,
                undefined,
                postId
            );

            if(response.success) {
                setPostData(response.data);
                if (response.data.isLiked) {
                    toggleLikes(true);
                }
            }
    }

    const likeAction = () => {
        if (postData) {
            if (liked) {
                postData.likes += 1;
                postData.isLiked = true;
                setLikeRequestQueue((prevState) => [...prevState, () => likeActionResolve(true)])
            } else {
                postData.likes -= 1;
                postData.isLiked = false;
                setLikeRequestQueue((prevState) => [...prevState, () => likeActionResolve(true)])
            }
            toggleLikes((prevState) => !prevState);
        }
    }

    const likeActionResolve = async (like: boolean) => {
        if (postData) {
            if (like) {
                await safeAPICall<SuccessfulResponse>(tokens, fetchLikePost, navigate, undefined, postId);
            } else {
                await safeAPICall<SuccessfulResponse>(tokens, fetchUnlikePost, navigate, undefined, postId);
            }
        }
    }

    const resolveLikesQueue = async () => {
        if (resolveLikesQueue.length > maxRequestsQueueLength) {
            setLikeRequestQueue([]);
            window.alert(tooMuchActivityMessage);
            return;
        }
        console.log("Resolving");
        console.log(likeRequestQueue)

        const toResolve = likeRequestQueue[0];

        if (toResolve) {
            await toResolve();
            setLikeRequestQueue((prevState) => prevState.slice(1));
        }

        console.log(likeRequestQueue);

        setTimeout(resolveLikesQueue, 2000);
    }

    const likeTimeout = setTimeout(resolveLikesQueue, 200);

    useEffect(() => {
        toggleLikes(false);
        setPostData(undefined);
        postFetcher();

        return () => { clearTimeout(likeTimeout); }
    }, [postId])

    if(!postData) {
        return null;
    }

    return (
        <div key={location.pathname + location.search}>
            { postData.parentPost ?
            <Link to={specificPostURI(postData.parentPost.postId)}>
                <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                    <p className="text-white"><span className="font-bold">Reply to:</span> {postData.parentPost?.title}</p>
                </div>
            </Link> : null }
            <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
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
                            <div className="relative block aspect-square cursor-pointer" key={index}>
                                <img className="w-full h-full object-cover rounded-lg" src={url} alt="Post image"/>
                            </div>
                        )
                        })
                    }
                </div>
                <div className="flex justify-start items-center gap-3">
                    <button onClick={()=> likeAction()}>
                        <img src={liked ? "/thumbs-up-filled.png" : "/thumbs-up.png"} alt="like-icon" className="h-8 mt-4 hover:scale-110 transition-all" />
                    </button>
                    <div className="mt-4 text-white flex gap-3">
                        <span>Likes: {postData.likes}</span> <span>Views: {postData.views}</span>
                    </div>
                </div>
            </div>

            <MakePost postType={"reply"} parentPostId={postData.postId} />

            <div className="w-[900px] mx-auto p-6 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12">
                <div className="font-bold text-xl text-white">Comments {postData.replies}:</div>
                <PostComments originalPostData={postData} />
            </div>
        </div>
    );
}

export default PostPage