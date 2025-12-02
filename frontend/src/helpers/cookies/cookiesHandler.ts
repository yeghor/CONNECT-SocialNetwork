import Cookies from 'universal-cookie';
import { RedirectFunction } from 'react-router';

import { TokenCookieExpiryHours } from "../../consts.ts"
import { refreshTokenURL } from "../../fetching/urls.ts";

import {
    AccessTokenCookieKey,
    RefreshTokenCookieKey,
    appLoginURI
} from "../../consts.ts"
import { NavigateFunction } from "react-router-dom";

const cookies = new Cookies();


export const setUpdateCookie = (key: string, value: string, expiry?: Date): void => {
    if(!expiry) {
        const now = new Date();
        expiry = new Date(now);
        expiry.setHours(expiry.getHours() + TokenCookieExpiryHours);
    }

    cookies.set(key, value, expiry ? { "expires": expiry } : undefined);
}

export const removeCookie = (key: string): void => {
    cookies.remove(key);
}


type AccessKey = string;
type RefreshKey = string;

export interface CookieTokenObject {
    access: AccessKey | undefined,
    refresh: RefreshKey | undefined
}

export const getCookies = (): CookieTokenObject => {
    return {
        access: cookies.get(AccessTokenCookieKey),
        refresh: cookies.get(RefreshTokenCookieKey)
    };
}


export const getCookiesOrRedirect = (navigate: NavigateFunction): CookieTokenObject => {
    const possibleCookies = getCookies();

    if(!possibleCookies.access || !possibleCookies.refresh) {
        navigate(appLoginURI);
    }

    // Anyway returning tokens to prevent unnecessary the function response type check
    // Because after redirecting app won't be able to use invalid tokens.
    return possibleCookies;
}
