import { CookieTokenObject } from "../../../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import {PostCommentsResponse, ShortPostInterface} from "../../../../fetching/DTOs.ts";
import { fetchLoadPost, fetchPostComments } from "../../../../fetching/fetchSocial.ts";
import {validateGETResponse} from "../../../../helpers/responseHandlers/getResponseHandlers.ts";
import { checkUnauthorizedResponse, retryUnauthorizedResponse } from "../../../../fetching/fetchUtils.ts";
import {internalServerErrorURI} from "../../../../consts.ts";

export interface CommentProps {
    originalPostData: ShortPostInterface
}

const commentsFetcher = async (tokens: CookieTokenObject, postId: string, page: number, navigate: NavigateFunction) => {
    if(!(tokens.access && tokens.refresh && postId)) {  return; }

    try {
        let response = await fetchPostComments(tokens.access, postId, page);

        if (!validateGETResponse(response, undefined, navigate)) {
            return;
        }

        if (checkUnauthorizedResponse(response)) {
            const retried = await retryUnauthorizedResponse<PostCommentsResponse>(fetchLoadPost, tokens.refresh, navigate, undefined, postId);
            if (!retried) {
                return;
            }
            response = retried;
        }

        if (response.success) {
            return response;
        }

    } catch (err) {
        console.error(err);
        navigate(internalServerErrorURI);
    }
};

export default commentsFetcher;