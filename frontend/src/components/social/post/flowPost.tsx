import React from "react";
import { FeedPostResponse } from "../../../fetching/responseDTOs.ts";
import OwnerComponent from "./owner.tsx";
import {Link} from "react-router-dom";

import { specificPostURI } from "../../../consts.ts";

const FlowPost = (props: { postData: FeedPostResponse | undefined }) => {
    const images = props.postData?.picturesURLs || [];

    return (
        <div className="bg-white/10 border border-white/30 rounded-lg shadow-sm overflow-hidden flex flex-col m-8">
            {props.postData?.isReply && props.postData?.parentPost && (
                <Link to={specificPostURI(props.postData.parentPost.postId)}>
                    <div className="bg-white/10 text-white text-sm p-2 rounded m-2">
                        <span className="font-bold">Reply to:</span> {props.postData.parentPost.title}
                    </div>
                </Link>
            )}

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

                {props.postData?.owner && (
                    <div className="text-gray-300">
                        <OwnerComponent ownerData={props.postData.owner} />
                    </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-300 mt-2">
                    <span>Likes: {props.postData?.likes || 0}</span>
                    <span>Views: {props.postData?.views || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default FlowPost;


