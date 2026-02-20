import {
    BadResponse,
    isBadResponse,
    badResponseMapper, AccessTokenResponse, SuccessfulResponse, createBadResponseManually,
    successfulResponseMapper
} from "./DTOs.ts"
import { NavigateFunction}  from "react-router-dom";
import { fetchRefresh } from "./fetchAuth.ts";
import { CookieTokenObject, setUpdateCookie } from "../helpers/cookies/cookiesHandler.ts";
import {
    AccessTokenCookieKey, internalServerErrorDefaultMessage,
    internalServerErrorURI,
    manualUnauthorizedMessage,
    unauthorizedRedirectURI
} from "../consts.ts";
import { validateGETResponse as validateResponse } from "../helpers/responseHandlers/getResponseHandlers.ts";

// & Types Intersection
// If object type {success: false} intersects with BadResponse *(which has that exactly field)* - function return type will be BadResponse
export type APIResponse<R> = Promise<R & {success: true} | BadResponse & {success: false}>
export type APIResponseResolved<R> = R & {success: true} | BadResponse & {success: false}

export const fetchHelper = async <ResponseType>(requestURL: string, requestInit: RequestInit, DTOMapper: CallableFunction): Promise<ResponseType | BadResponse> => {
    const response = await fetch(requestURL, requestInit);
    const responseDTO = await response.json();

    if(responseDTO === undefined) {
        if(response.status === 200) {
            // The code is safe
            // @ts-ignore
            return successfulResponseMapper();
        } else {
            return createBadResponseManually(response.statusText, response.status);
        }
    }

    if(isBadResponse(responseDTO)) {
        return badResponseMapper(responseDTO, response.status);
    } else {
        return DTOMapper(responseDTO);
    }
}

const refreshTokens = async (navigate: NavigateFunction, refreshToken: string): APIResponse<AccessTokenResponse> => {
    const response = await fetchRefresh(refreshToken);

    validateResponse(response, undefined, navigate);

    return response;
}


export const checkUnauthorizedResponse = (response: BadResponse | SuccessfulResponse): boolean => {
    if (!response.success) {
        if (response.statusCode === 401) {
            return true;
        }
    }

    return false;
}

/*
If 401 again - redirecting to unauthorized URI *(login or register)* and returning null.

Do **NOT** provide old accessJWT in fetchArgs. And make sure that args are in correct order. Do NOT pass auth token manually as e fetchFunc argument!
*/
export const retryUnauthorizedResponse = async <R>(fetchFunc: CallableFunction, refreshToken: string, navigate: NavigateFunction, setErrorMessage?: CallableFunction, ...fetchArgs: any[]): Promise<APIResponse<R>> => {
    const tokensResponse = await refreshTokens(navigate, refreshToken);

    if(tokensResponse.success) {
        setUpdateCookie(AccessTokenCookieKey, tokensResponse.accessToken, null);
        const retryResponse: BadResponse | SuccessfulResponse = await fetchFunc(tokensResponse.accessToken, ...fetchArgs);

        // Extra !retryResponse.success check to tell ts that response type is BadResponse, and it has statusCode field
        if(validateResponse(retryResponse, setErrorMessage,  navigate)) {
            if (checkUnauthorizedResponse(retryResponse)) {
                navigate(unauthorizedRedirectURI);
            }
        }

        return retryResponse;
    } else {
        validateResponse(tokensResponse, undefined, navigate);
        navigate(unauthorizedRedirectURI);
        return tokensResponse;
    }
}


/*
* Makes safe API call with access token, validating errors, retrying if 401
* Do **NOT** pass auth tokens to function in fetchArgs[]
* */
export const safeAPICall = async <ResponseType>(
    tokens: CookieTokenObject,
    fetchFunc: CallableFunction,
    navigate: NavigateFunction,
    setErrorMessage?: CallableFunction,
    ...funcArgs: any[]
): Promise<ResponseType | BadResponse> => {
    if(!(tokens.access && tokens.refresh)) {
        return createBadResponseManually(manualUnauthorizedMessage, 401);
    }

    try {
        let response = await fetchFunc(tokens.access, ...funcArgs);        

        if (validateResponse(response, setErrorMessage, navigate)) {
            if(checkUnauthorizedResponse(response)) {
                response = await retryUnauthorizedResponse<ResponseType>(fetchFunc, tokens.refresh, navigate, setErrorMessage, ...funcArgs);
            }
        }

        return response;

    } catch (err) { 
        console.error(err);
        console.log("catched error ")
        
        navigate(internalServerErrorURI);
        return createBadResponseManually(internalServerErrorDefaultMessage, 500);
    }
};

/*
* Makes safe API call to public endpoints, validating errors, doesn't try to refresh tokens on 401
* Do **NOT** pass auth tokens to function in fetchArgs[]
* */
export const safeAPICallPublic = async <ResponseType>(
    authToken: string | null, // Could be refresh token or password recovery token
    fetchFunc: CallableFunction,
    navigate: NavigateFunction,
    setErrorMessage?: CallableFunction,
    ...funcArgs: any[]
): Promise<ResponseType | BadResponse> => {
    try {
        const fetchArgs = authToken ? [authToken, ...funcArgs] : [...funcArgs]
        let response = await fetchFunc(...fetchArgs);
        validateResponse(response, setErrorMessage, navigate)

        return response;

    } catch (err) { 
        console.error(err);
        console.log("catched fetch errror")
        navigate(internalServerErrorURI);
        return createBadResponseManually(internalServerErrorDefaultMessage, 500);
    }
};
