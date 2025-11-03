import React, { useState } from "react";
import {ShortPostInterface} from "../../../../fetching/responseDTOs.ts";

interface PostCommentProps {
    commentData: ShortPostInterface
}

const PostComment = (props: PostCommentProps) => {
    console.log("Rendering PostComment");
    return(
        <div className="rounded-lg w-full h-full bg-white/30" key={props.commentData.postId}>
            <div className="py-4 px-2 text-white">
                <p className="text-bold">{props.commentData.title}</p>
                <div>
                    <span>{props.commentData.owner.username}:</span>
                    <span>{props.commentData.published.toISOString().split("T")[0]}</span>
                    <span className="mx-2">{`${props.commentData.published.getHours()}:${props.commentData.published.getMinutes()}`}</span>
                </div>
                <div>
                    <ul>
                        {
                            props.commentData.picturesURLs?.map((url: string, index: number) => {
                                return (
                                    <li key={index}>
                                        <img src={url} alt="Comment Image" className="h-30 w-30 rounded-lg" />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PostComment;