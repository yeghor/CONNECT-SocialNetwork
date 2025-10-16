import React from "react";

import { FeedPostResponse } from "../../../fetching/responseDTOs.ts";
import {RowComponentProps} from "react-window";

const PostComponent = (props: { postData: FeedPostResponse }) => {
    return (
        <div>
            <p>{props.postData.title}</p>
        </div>
    );
}

export default PostComponent;