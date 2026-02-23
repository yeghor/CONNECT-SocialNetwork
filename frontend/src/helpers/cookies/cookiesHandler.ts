import Cookies from 'universal-cookie';

import { TokenCookieExpiryHours } from "../../consts.ts"
import { NavigateFunction } from "react-router-dom";

import {
    AccessTokenCookieKey,
    RefreshTokenCookieKey,
    loginURI
} from "../../consts.ts"

const cookies = new Cookies();


export const setUpdateCookie = (key: string, value: string | null, expiry: Date | null): void => {
    console.log(key, value, expiry)
    if(!expiry) {
        const now = new Date();
        expiry = new Date(now);
        expiry.setHours(expiry.getHours() + TokenCookieExpiryHours);
    }
    if (value) {
        cookies.set(key, value, expiry ? { "expires": expiry } : undefined);
    }
};

export const removeCookie = (key: string): void => {
    cookies.remove(key);
};

export interface CookieTokenObject {
    access: string | undefined,
    refresh: string | undefined
};

export const getCookies = (): CookieTokenObject => {
    return {
        access: cookies.get(AccessTokenCookieKey),
        refresh: cookies.get(RefreshTokenCookieKey)
    };
};

/* Skip navigate args to not get redirected to auth page when there is no tokens */
export const getCookieTokens = (navigate: NavigateFunction | undefined): CookieTokenObject => {
    const possibleCookies = getCookies();

    if(navigate && (!possibleCookies.access || !possibleCookies.refresh)) {
        navigate(loginURI);
    }

    // Anyway returning tokens to prevent unnecessary the function response type check
    // Because after redirecting app won't be able to use invalid tokens.
    return possibleCookies;
};
