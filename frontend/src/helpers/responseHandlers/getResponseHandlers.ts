import {AccessTokenResponse, BadResponse, SuccessfulResponse} from "../../fetching/responseDTOs.ts"
import {
    AccessTokenCookieKey,
    unauthorizedRedirectURI,
    internalServerErrorURI, RefreshTokenCookieKey
} from "../../consts.ts";
import {getCookies, getCookiesOrRedirect, setUpdateCookie} from "../cookies/cookiesHandler.ts";
import  { fetchRefresh } from "../../fetching/fetchAuth.ts";
import { NavigateFunction } from "react-router-dom"
import {APIResponse} from "../../fetching/fetchUtils.ts";

/*
This functions does NOT validate 401 code. Code 401 - returns true
*/
export const validateResponse = (response: BadResponse | SuccessfulResponse, setErrorMessage?: CallableFunction, navigate?: NavigateFunction): boolean => {
    if (response.success || response.statusCode === 401) {
        return true;
    } else {
        if (response.statusCode === 500) { 
            if (navigate) {
                navigate(internalServerErrorURI);
                return false;                
            }
        }
        if (setErrorMessage) {
            setErrorMessage(response.detail);
        }

        return false;
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

Do **NOT** provide old accessJWT in fetchArgs. And make sure that args are in correct order. Do NOT pass auth token manually as e fetchFunc arg!
*/
export const retryUnauthorizedResponse = async <R>(fetchFunc: CallableFunction, refreshToken: string, navigate: NavigateFunction, setErrorMessage?: CallableFunction, ...fetchArgs: any[]): Promise<APIResponse<R> | undefined> => {
    const tokens = await refreshTokens(navigate, refreshToken);

    if(tokens.success) {
        setUpdateCookie(AccessTokenCookieKey, tokens.accessToken);

        const retryResponse: BadResponse | SuccessfulResponse = await fetchFunc(tokens.accessToken, ...fetchArgs);

        // Extra !retryResponse.success check to tell ts that response type is BadRepones. And it has statusCode field
        if(!validateResponse(retryResponse, setErrorMessage,  navigate) && !retryResponse.success) {
            if (checkUnauthorizedResponse(retryResponse)) {
                navigate(unauthorizedRedirectURI);
            }
        }

        return retryResponse;
    } else {
        validateResponse(tokens, undefined, navigate);
    }
}
