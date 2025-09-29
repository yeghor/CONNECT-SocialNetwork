import {
    APIResponse,
    fetchHelper
} from './fetchUtils.ts';

import {
    loginURL,
    registerURL,
    logoutURL,
    refreshTokenURL,
    changePasswordURL,
    changeUsernameURL,
} from "./urls.ts";

import { 
    requestTokenHeaders,
    requestHeaders,
    loginBody,
    registerBody,
    changePasswordBody, 
    changeUsernameBody
} from "./requestConstructors.ts"

import {
    SuccessfullResponse,
    succesfullResponseCreator,
    BadResponse,
    isBadResponse,
    AuthResponseDTO,
    AuthTokensResponse,
    authTokensResponseMapper,
    AccesTokenResponse,
    AccessTokenDTO,
    accesTokenResponseMapper,
    badResponseMapper,
} from "./responseDTOs.ts"


export const fetchLogin = async (username: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(loginBody(username, password))
    };

    return await fetchHelper<AuthTokensResponse>(loginURL, requestInit, authTokensResponseMapper);
}

export const fetchRegister = async (username: string, email: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(registerBody(username, email, password))
    };

    return await fetchHelper<AuthTokensResponse>(registerURL, requestInit, authTokensResponseMapper);
}

export const fetchRefresh = async (refreshJWT: string): APIResponse<AccesTokenResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestTokenHeaders(refreshJWT),
    };

    return await fetchHelper<AccesTokenResponse>(refreshTokenURL, requestInit, authTokensResponseMapper);
}

export const fetchChangePassword = async (accessJWT: string, oldPassword: string, newPassword: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePasswordBody(oldPassword, newPassword))
    };

    return await fetchHelper<SuccessfullResponse>(changePasswordURL, requestInit, succesfullResponseCreator);
}

export const fetchChangeUsername = async (accessJWT: string, newUsername: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit  = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changeUsernameBody(newUsername))
    };

    return await fetchHelper<SuccessfullResponse>(changeUsernameURL, requestInit, succesfullResponseCreator);
}