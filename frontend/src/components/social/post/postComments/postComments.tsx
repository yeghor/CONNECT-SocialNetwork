import React, {useState, useEffect, useRef} from "react";

import PostComment from "./onePostComment.tsx"

import commentFetchHelper, { CommentProps } from "./commentFetchHelper.ts";
import { PostCommentsResponse, ShortPostInterface } from "../../../../fetching/responseDTOs.ts";
import {useNavigate} from "react-router";
import {getCookiesOrRedirect} from "../../../../helpers/cookies/cookiesHandler.ts";
import {useParams} from "react-router-dom";
import {fetchPostComments} from "../../../../fetching/fetchSocial.ts";

/* Use this component only in /post/UUID route */
const PostComments = (props: CommentProps) => {
    const { postId } = useParams();
    if (postId) {
        props.originalPostData.postId = postId
    }

    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);

    const [ postComments, setPostComments ] = useState<ShortPostInterface[]>([]);

    const [ loadMoreTrigger, setLoadMoreTrigger ] = useState<boolean>(false);
    const [ page, setPage ] = useState<number>(0);

    const [hasMore, setHasMore] = useState<boolean>(props.originalPostData.replies > 0);

    useEffect(() => {
        const fetchWrapper = async () => {
            const response = await commentFetchHelper(tokens, props.originalPostData.postId, page, navigate);
            if (response) {
                setPostComments((prev) => {
                    const updatedComments = [...prev, ...response.data];
                    // React updates states asynchronously, so we need to update hasMore state inside setPostComments to update it before render
                    setHasMore(updatedComments.length < props.originalPostData.replies);
                    return updatedComments;
                });
                setPage((prev) => prev + 1);
            }
        };
        fetchWrapper();
    }, [loadMoreTrigger]);

    const loadMoreClick = (): void => {
        setLoadMoreTrigger(!loadMoreTrigger);
    }

    return(
        <div>
            <div className="pl-2">
                {
                    postComments && postComments.map((commentData) => {
                        return (
                            <PostComment commentData={commentData} />
                        );
                    })
                }
                { hasMore &&  <button onClick={() => loadMoreClick()} className="text-blue-500 hover:underline">Load More</button>}
            </div>
        </div>
    );
};

export default PostComments;
