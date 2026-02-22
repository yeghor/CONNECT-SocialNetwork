import React, {useState, useEffect, useRef} from "react";

import PostComment from "./postComment.tsx";

import commentFetchHelper, { CommentProps } from "./commentFetchHelper.ts";
import { PostCommentsResponse, ShortPostInterface } from "../../../../fetching/DTOs.ts";
import {useNavigate} from "react-router";
import {getCookiesOrRedirect} from "../../../../helpers/cookies/cookiesHandler.ts";
import {useParams} from "react-router-dom";
import {fetchPostComments} from "../../../../fetching/fetchSocial.ts";
import { safeAPICallPrivate } from "../../../../fetching/fetchUtils.ts";

const PostComments = (props: CommentProps) => {
    let isMounted = true;

    // const { postId } = useParams();
    // if (postId && postId !== props.originalPostData.postId) {
    //     props.originalPostData.postId = postId
    // }

    console.log(props)

    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);

    const [ postComments, setPostComments ] = useState<ShortPostInterface[]>([]);

    const [ loadMoreTrigger, setLoadMoreTrigger ] = useState<boolean>(false);
    const [ showLoadMore, setShowLoadMore ] = useState<boolean>(false);
    const [ page, setPage ] = useState<number>(0);

    const [ hasMore, setHasMore ] = useState<boolean>(props.originalPostData.replies > 0);

    useEffect(() => {
        const fetchWrapper = async () => {
            setShowLoadMore(false)
            const response = await safeAPICallPrivate<PostCommentsResponse>(tokens, fetchPostComments, navigate, undefined, props.originalPostData.postId, page);
            if (response.success && response.data.length > 0) {
                setPostComments((prevState) => {
                    console.log("setting", hasMore)
                    const updatedComments = [...prevState, ...response.data];
                    // React updates states asynchronously, so we need to update hasMore state inside setPostComments to update it before render
                    setHasMore(updatedComments.length < props.originalPostData.replies);
                    return updatedComments;
                });
                setPage((prev) => prev + 1);
            } else {
                setHasMore(false);
            }
            setShowLoadMore(true);
        };
        fetchWrapper();

        return () => { isMounted = false }
    }, [loadMoreTrigger]);

    useEffect(() => {
        setPostComments([]);
        setPage(0);
        setHasMore(props.originalPostData.replies > 0);
    }, [props.originalPostData.postId]);

    const loadMoreClick = (): void => {
        setLoadMoreTrigger(!loadMoreTrigger);
    }

    return(
        <div>
            <div>
                {
                    postComments && postComments.map((commentData) => {
                        return (
                            <PostComment key={commentData.postId} commentData={commentData} />
                        );
                    })
                }
                { (showLoadMore && hasMore) &&  <button onClick={() => loadMoreClick()} className="text-blue-500 hover:underline">Load More</button>}
            </div>
        </div>
    );
};

export default PostComments;
