import React, { useState } from "react";
import {ShortPostInterface} from "../../../../fetching/DTOs.ts";
import {specificPostURI} from "../../../../consts.ts";
import {Link} from "react-router-dom";

interface PostCommentProps {
    commentData: ShortPostInterface
}

const PostComment = (props: PostCommentProps) => {
    console.log("Rendering PostComment");
    return(
        <div className="rounded-lg w-full h-full bg-white/20" key={props.commentData.postId}>
            <Link to={specificPostURI(props.commentData.postId)}>
                <div className="py-4 px-2 m-4 text-white">
                    <p className="font-bold">{props.commentData.title}</p>
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
            </Link>
        </div>
    );
};

export default PostComment;