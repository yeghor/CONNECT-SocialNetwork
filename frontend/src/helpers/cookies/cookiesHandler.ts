import Cookies from 'universal-cookie';
import { RedirectFunction } from 'react-router';

import { TokenCookieExpiryHours } from "../../consts.ts"
import { refreshTokenURL } from "../../fetching/urls.ts";

import {
    AccessTokenCookieKey,
    RefreshTokenCookieKey,
    appLoginURI
} from "../../consts.ts"

const cookies = new Cookies();


export const setUpdateCookie = (key: string, value: string): void => {
    const now = new Date();
    const expires = new Date(now);
    expires.setHours(expires.getHours() + TokenCookieExpiryHours);
    
    cookies.set(key, value, expires ? { "expires": expires } : undefined);
}

export const removeCookie = (key: string): void => {
    cookies.remove(key);
}


type AccessKey = string;
type RefreshKey = string;

interface CookieTokenObject {
    access: AccessKey | undefined,
    refresh: RefreshKey | undefined
};

const getCookies = (): CookieTokenObject => {
    return {
        access: cookies.get(AccessTokenCookieKey),
        refresh: cookies.get(RefreshTokenCookieKey)
    };
}


export const getCookiesOrRedirect = (redirect: RedirectFunction): CookieTokenObject => {
    const possibleCookies = getCookies();

    if(!possibleCookies.access || !possibleCookies.refresh) {
        redirect(appLoginURI);
    }

    // Anyway returning tokens to prevent unnecessary the function response type check
    // Because after recirecting app won't be able to use invalid tokens.
    return possibleCookies;
}
