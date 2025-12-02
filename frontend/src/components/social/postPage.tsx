import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import PostComments from "./post/postComments/postComments.tsx"

import { getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import { LoadPostResponseInterface, LoadPostResponse, SuccessfulResponse } from "../../fetching/responseDTOs.ts";
import { fetchLikePost, fetchLoadPost, fetchUnlikePost } from "../../fetching/fetchSocial.ts";

import { safeAPICall } from "../../fetching/fetchUtils.ts";
import MakePost from "./post/makePost.tsx";
import { maxRequestsQueueLength, specificPostURI, tooMuchActivityMessage } from "../../consts.ts";
import OwnerComponent from "./post/owner.tsx";

const PostPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ liked, toggleLikes ] = useState(false);
    const [ likeTimeout, setLikeTimeout ] = useState(false);

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

    const likeAction = async () => {
        if (postData && !likeTimeout) {
            setLikeTimeout(true);
            if (liked) {
                postData.likes -= 1;
                postData.isLiked = false;
                toggleLikes(postData.isLiked);
                await safeAPICall<SuccessfulResponse>(tokens, fetchUnlikePost, navigate, undefined, postId);
            } else {
                postData.likes += 1;
                postData.isLiked = true;
                toggleLikes(postData.isLiked);
                await safeAPICall<SuccessfulResponse>(tokens, fetchLikePost, navigate, undefined, postId);
            }
            setTimeout(() => setLikeTimeout(false), 200);
        }
    }

    useEffect(() => {
        toggleLikes(false);
        setPostData(undefined);
        postFetcher();
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
                    <OwnerComponent ownerData={postData.owner} postPublished={postData.published} avatarHeight={10} />
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
                    <button onClick={()=> { if(!likeTimeout) { likeAction() } }}>
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

export default PostPage;