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
    confirmSecondFactorURL,
    issueNewSecondFactor as issueNewSecondFactorURL,
} from "./urls.ts";

import { 
    requestTokenHeaders,
    requestHeaders,
    loginBody,
    registerBody,
    logoutBody,
    changePasswordBody, 
    changeUsernameBody,
    confirmSecondFactorBody,
    issueNewSecondFactorBody
} from "./requestConstructors.ts"

import {
    SuccessfulResponse,
    successfulResponseMapper,
    AuthTokensResponse,
    authTokensResponseMapper,
    AccessTokenResponse,
    EmailToConfirmResponse,
    emailToConfirmResponseMapper,
} from "./DTOs.ts"


export const fetchLogin = async (username: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(loginBody(username, password))
    };

    return await fetchHelper<AuthTokensResponse>(loginURL, requestInit, authTokensResponseMapper);
}

export const fetchRegister = async (username: string, email: string, password: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(registerBody(username, email, password))
    };

    return await fetchHelper<EmailToConfirmResponse>(registerURL, requestInit, emailToConfirmResponseMapper);
}

export const fetchRefresh = async (refreshJWT: string): APIResponse<AccessTokenResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestTokenHeaders(refreshJWT),
    };

    return await fetchHelper<AccessTokenResponse>(refreshTokenURL, requestInit, authTokensResponseMapper);
}

export const fetchChangePassword = async (accessJWT: string, oldPassword: string, newPassword: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePasswordBody(oldPassword, newPassword))
    };

    return await fetchHelper<EmailToConfirmResponse>(changePasswordURL, requestInit, successfulResponseMapper);
}

export const fetchChangeUsername = async (accessJWT: string, newUsername: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit  = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changeUsernameBody(newUsername))
    };

    return await fetchHelper<SuccessfulResponse>(changeUsernameURL, requestInit, successfulResponseMapper);
}

export const fetchLogout = async (accessJWT: string, rerfreshJWT: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(logoutBody(accessJWT, rerfreshJWT))
    }

    return await fetchHelper<SuccessfulResponse>(logoutURL, requestInit, successfulResponseMapper);
}

export const fetchConfirmSecondFactor = async (confirmationCode: string, email: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(confirmSecondFactorBody(confirmationCode, email))
    };

    return await fetchHelper<AuthTokensResponse>(confirmSecondFactorURL, requestInit, authTokensResponseMapper);
}

export const fetchIssueNewSecondFactor = async (email: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(issueNewSecondFactorBody(email))
    };

    return await fetchHelper<EmailToConfirmResponse>(issueNewSecondFactorURL, requestInit, emailToConfirmResponseMapper);
}
