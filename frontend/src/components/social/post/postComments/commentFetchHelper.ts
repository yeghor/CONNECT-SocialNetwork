import { CookieTokenObject } from "../../../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import { PostCommentsResponse } from "../../../../fetching/responseDTOs.ts";
import { fetchLoadPost, fetchPostComments } from "../../../../fetching/fetchSocial.ts";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../../../helpers/responseHandlers/getResponseHandlers.ts";
import {internalServerErrorURI} from "../../../../consts.ts";

const commentsFetched = async (tokens: CookieTokenObject, postId: string, page: number, navigate: NavigateFunction): PostCommentsResponse | undefined => {
    if(!(tokens.access && tokens.refresh && postId)) {  return; }

    try {
        let response = await fetchPostComments(tokens.access, postId, page);

        if (!validateResponse(response, undefined, navigate)) {
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

export default commentsFetched;