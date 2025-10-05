import { TOKENCOOKIEEXPIRYHOURS } from "../../consts.ts"
import Cookies from 'universal-cookie';

const cookies = new Cookies();



export const setUpdateCookie = (key: string, value: string): void => {
    const now = new Date();
    const expires = new Date(now);
    expires.setHours(expires.getHours() + TOKENCOOKIEEXPIRYHOURS);
    
    cookies.set(key, value, expires ? {"expires": expires} : undefined);
}

export const removeCookie = (key: string): void => {
    cookies.remove(key);
}

export const getCookie = (key: string): any | null => {
    return cookies.get(key);
}

