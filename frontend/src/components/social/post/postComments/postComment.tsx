import React, { useState, useEffect } from "react";

import commentFetchHelper from "./commentFetchHelper.ts";
import { PostCommentsResponse, ShortPostInterface } from "../../../../fetching/responseDTOs.ts";
import {useNavigate} from "react-router";
import {getCookiesOrRedirect} from "../../../../helpers/cookies/cookiesHandler.ts";

interface CommentProps {
    originalCommentData: ShortPostInterface
}

const PostComment = (props: CommentProps) => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);

    // Show button 'load more' only if lastResponseLen !== 0
    const [ lastResponseLen, setLastResponseLen ] = useState<number>(0);
    const [ postComments, setPostComments ] = useState<PostCommentsResponse | undefined>();

    const [ loadMoreTrigger, setLoadMoreTrigger ] = useState<boolean>(false);
    const [ page, setPage ] = useState<number>(0);

    useEffect(() => {
        const fetchWrapper = async () => {
            const response = await commentFetchHelper(tokens, props.originalCommentData.postId, page, navigate);
            if(response) {
                setPostComments(response);
            }
        }
        fetchWrapper();
    }, [loadMoreTrigger, setLoadMoreTrigger, page, setPage]);

    const loadMoreClick = (): void => {
        setLoadMoreTrigger(!loadMoreTrigger);
        setPage((prevState) => prevState + 1);
    }

    return(
        <div></div>
    );
};

export default PostComment;
