import { AccessTokenResponse, BadResponse, SuccessfulResponse } from "../../fetching/DTOs.ts"
import {
    AccessTokenCookieKey,
    unauthorizedRedirectURI,
    internalServerErrorURI, RefreshTokenCookieKey,
    notFoundURI
} from "../../consts.ts";
import { getCookies, getCookiesOrRedirect, setUpdateCookie } from "../cookies/cookiesHandler.ts";
import  { fetchRefresh } from "../../fetching/fetchAuth.ts";
import { NavigateFunction } from "react-router-dom"
import { APIResponse } from "../../fetching/fetchUtils.ts";

/*
This functions does NOT validate 401 code. Code 401 - returns true
*/
export const validateGETResponse = (response: BadResponse | SuccessfulResponse, setErrorMessage?: CallableFunction, navigate?: NavigateFunction): boolean => {
    if (response.success || response.statusCode === 401) {
        return true;
    } else {
        if (response.statusCode === 500) { 
            if (navigate) {
                navigate(internalServerErrorURI);                
            }
        } else if (response.statusCode === 404) {
            if (navigate) {
                navigate(notFoundURI);
            }
        
            return false;
        }
        if (setErrorMessage) {
            setErrorMessage(response.detail);
        }

        return false;
    }
}

