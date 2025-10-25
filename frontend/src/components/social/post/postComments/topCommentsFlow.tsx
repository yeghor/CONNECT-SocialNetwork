import React, { useState, useEffect } from "react";

import {LoadPostResponse, PostCommentsResponse} from "../../../../fetching/responseDTOs.ts";

interface CommentFlowProps {
    originalPostId: string | undefined;
}


const CommentsFlow = (props: CommentFlowProps) => {
    if(!props.originalPostId) {
        return null;
    }

    const [ currLevelComments, setCurrLevelComments ] = useState<PostCommentsResponse | undefined>();

    return (
        <div>

        </div>
    );
};

export default CommentsFlow;