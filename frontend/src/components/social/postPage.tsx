import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import {LoadPostResponseInterface} from "../../fetching/responseDTOs.ts";
import {fetchLoadPost} from "../../fetching/fetchSocial.ts";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import {internalServerErrorURI} from "../../consts.ts";


const PostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const tokens = getCookiesOrRedirect(navigate);

    const [ postData, setPostData ] = useState<LoadPostResponseInterface | undefined>(undefined);

    const postFetcher = async (): Promise<void> => {
        // If statement to prevent TS errors. Cause if no tokens - getCookiesOrRedirect will redirect user to auth page
        if(tokens.access && tokens.refresh && postId) {
                try {
                const response = await fetchLoadPost(tokens.access, postId);

                if(!validateResponse(response, undefined, navigate)) {
                    return;
                }

                if(checkUnauthorizedResponse(response)) {
                    const retriedResponse = await retryUnauthorizedResponse(fetchLoadPost, tokens.refresh, navigate, undefined, postId);
                    if(!retriedResponse) {
                        return;
                    }
                }

                if(response.success) {
                    setPostData(response.data);
                }
            }
        catch (err) {
            console.error(err);
            navigate(internalServerErrorURI);
        }}
    }

    useEffect(() => {
        postFetcher();
    }, [])

    return(
        <div>
            <div className="flex items-center justify-start px-72 py-8 mb-6 not-italic">
                <div className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white">
                    <img className="mr-4 w-12 h-12 rounded-full"
                         src="/uknown-user-image.jpg" alt="Jese Leos"/>
                    <div>
                        <a href="#" rel="author" className="text-xl font-bold text-gray-900 dark:text-white">{postData?.owner.username}</a>
                    </div>
                </div>

                <div className="gap-4">
                    <ul>
                        {postData?.picturesURLs.map((imageURL) => (
                            (
                                <li>
                                    <img src={imageURL} alt="Post picture"></img>
                                </li>

                            )
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default PostPage