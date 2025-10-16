import React from "react";

import { FeedPostResponse } from "../../../fetching/responseDTOs.ts";
import {RowComponentProps} from "react-window";

const PostComponent = (props: { postData: FeedPostResponse | undefined }) => {
    return (
        <div>
            <p>{props.postData ? props.postData.title : null}</p>
        </div>
    );
}

export default PostComponent;