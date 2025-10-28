import React, {useState, useEffect, useRef} from "react";

import PostComment from "./onePostComment.tsx"

import commentFetchHelper, { CommentProps } from "./commentFetchHelper.ts";
import { PostCommentsResponse, ShortPostInterface } from "../../../../fetching/responseDTOs.ts";
import {useNavigate} from "react-router";
import {getCookiesOrRedirect} from "../../../../helpers/cookies/cookiesHandler.ts";

const PostComments = (props: CommentProps) => {
    if(!props.originalPostData) {
        return null;
    }

    const pageRendered = useRef(false);

    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);

    // Show button 'load more' only if lastResponseLen !== 0
    const [ lastResponseLen, setLastResponseLen ] = useState<number>(0);
    const [ postComments, setPostComments ] = useState<ShortPostInterface[]>([]);

    const [ loadMoreTrigger, setLoadMoreTrigger ] = useState<boolean>(false);
    const [ page, setPage ] = useState<number>(0);

    useEffect(() => {
        const fetchWrapper = async () => {
            if(!pageRendered.current) {
                pageRendered.current = true;
                return;
            }
            const response = await commentFetchHelper(tokens, props.originalPostData.postId, page, navigate);
            if(response) {
                setPostComments((prevState) => [...prevState, ...response.data]);
                setLastResponseLen(response.data.length);
            }
        }
        fetchWrapper();
    }, [loadMoreTrigger, page]);

    const loadMoreClick = (): void => {
        setLoadMoreTrigger(!loadMoreTrigger);
        setPage((prevState) => prevState + 1);
    }

    return(
        <div>
            <PostComment commentData={props.originalPostData} />
            <div>
                {
                    postComments && postComments.map((commentData) => {
                        return (
                            <PostComment commentData={commentData} />
                        );
                    })
                }
                { lastResponseLen !== 0 &&  <button onClick={() => loadMoreClick()} className="text-blue-700 hover:underline">Load More</button>}
            </div>
        </div>
    );
};

export default PostComments;
