import React from "react";
import { FeedPost } from "../../../fetching/responseDTOs.ts";
import OwnerComponent from "./owner.tsx";
import {Link} from "react-router-dom";

import { specificPostURI } from "../../../consts.ts";

interface FlowPostProps {
    postData: FeedPost | undefined,
    isMyPost: boolean
}

const FlowPost = (props: FlowPostProps) => {
    const images = props.postData?.picturesURLs || [];

    // Guard for TS
    if(!props.postData) {
        return null;
    }

    return (
        <div className="border bg-white/10 border-white/20 border-3 rounded-lg shadow-sm flex flex-col hover:scale-105 transition-all m-6">
            {props.postData?.isReply && props.postData?.parentPost && (
                <Link to={specificPostURI(props.postData.parentPost.postId)}>
                    <div className="bg-white/10 text-white text-sm p-2 rounded m-2">
                        <span className="font-bold">Reply to:</span> {props.postData.parentPost.title}
                    </div>
                </Link>
            )}
            <Link to={specificPostURI(props.postData.postId)}>
                {images.length > 0 && (
                    <div className="grid gap-1 p-2">
                        <img
                            src={images[0]}
                            alt=""
                            className="w-full h-48 object-cover rounded"
                        />
                        {images.length > 1 && (
                            <div className="grid grid-cols-2 gap-1 mt-1">
                                {images[1] && (
                                    <img
                                        src={images[1]}
                                        alt=""
                                        className="w-full h-24 object-cover rounded"
                                    />
                                )}
                                {images[2] && (
                                    <img
                                        src={images[2]}
                                        alt=""
                                        className="w-full h-24 object-cover rounded"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 flex flex-col gap-2">
                    <h5 className="text-2xl font-bold text-white text-ce">{props.postData?.title}</h5>

                    <OwnerComponent ownerData={props.postData.owner} postPublished={props.postData.published} avatarHeight={8}/>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                        <span>Likes: {props.postData?.likes || 0}</span>
                        <span>Views: {props.postData?.views || 0}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default FlowPost;


