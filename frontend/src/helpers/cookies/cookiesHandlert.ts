import { TOKENCOOKIEEXPIRYHOURS } from "../../consts.ts"
import Cookies from 'universal-cookie';
import { refreshTokenURL } from "../../fetching/urls.ts";

const cookies = new Cookies();

const ACCESSTOKENCONST = "access-token";
const REFRESHTOKENCONST = "refresh-token";

export const setUpdateCookie = (key: string, value: string): void => {
    const now = new Date();
    const expires = new Date(now);
    expires.setHours(expires.getHours() + TOKENCOOKIEEXPIRYHOURS);
    
    cookies.set(key, value, expires ? {"expires": expires} : undefined);
}

export const removeCookie = (key: string): void => {
    cookies.remove(key);
}

export const getCookies = (): string[] => {
    return [cookies.get(ACCESSTOKENCONST), cookies.get(REFRESHTOKENCONST)];
}

