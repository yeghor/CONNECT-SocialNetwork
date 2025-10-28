import React, { useState } from "react";
import {ShortPostInterface} from "../../../../fetching/responseDTOs.ts";

interface PostCommentProps {
    commentData: ShortPostInterface
}

const PostComment = (props: PostCommentProps) => {
    if(!props.commentData) { return null; }

    return(
        <div className="bg-white/30 rounded-lg w-full h-full" key={props.commentData.postId}>
            <div className="py-4 px-2">
                <p className="text-black text-bold">{props.commentData.title}</p>
                <div>
                    <span>{props.commentData.owner.username}:</span>
                    <span>{props.commentData.published.toISOString().split("T")[0]}</span>
                    <span className="mx-2">{`${props.commentData.published.getHours()}:${props.commentData.published.getMinutes()}`}</span>
                </div>
            </div>
        </div>
    );
};

export default PostComment;