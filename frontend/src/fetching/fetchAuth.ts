import {
    APIResponse,
    fetchHelper
} from './fetchUtils.ts';

import {
    loginURL,
    registerURL,
    logoutURL,
    refreshTokenURL,
    requestPasswordRecoveryURL,
    changeUsernameURL,
    confirmEmail2FA_URL,
    issueNewSecondFactorURL,
    recoverPasswordURL,
} from "./urls.ts";

import { 
    requestTokenHeaders,
    requestHeaders,
    loginBody,
    registerBody,
    logoutBody,
    changePasswordBody, 
    changeUsernameBody,
    confirmSecondFactorBody as confirm2FABody,
    emailProvidedBody,
    recoverPasswordBody
} from "./requestConstructors.ts"

import {
    SuccessfulResponse,
    successfulResponseMapper,
    AuthTokensResponse,
    authTokensResponseMapper,
    AccessTokenResponse,
    EmailToConfirmResponse,
    emailToConfirmResponseMapper,
    PasswordRecoveryTokenResponse,
    passwordRecoveryTokenResponseMapper,
} from "./DTOs.ts"


export const fetchLogin = async (username: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(loginBody(username, password))
    };

    return await fetchHelper<AuthTokensResponse>(loginURL, requestInit, authTokensResponseMapper);
};

export const fetchRegister = async (username: string, email: string, password: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(registerBody(username, email, password))
    };

    return await fetchHelper<EmailToConfirmResponse>(registerURL, requestInit, emailToConfirmResponseMapper);
};

export const fetchRefresh = async (refreshJWT: string): APIResponse<AccessTokenResponse> => {
    const requestInit: RequestInit  = {
        method: "POST",
        headers: requestTokenHeaders(refreshJWT),
    };

    return await fetchHelper<AccessTokenResponse>(refreshTokenURL, requestInit, authTokensResponseMapper);
};

export const fetchChangeUsername = async (accessJWT: string, newUsername: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit  = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changeUsernameBody(newUsername))
    };

    return await fetchHelper<SuccessfulResponse>(changeUsernameURL, requestInit, successfulResponseMapper);
};

export const fetchLogout = async (accessJWT: string, rerfreshJWT: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(logoutBody(accessJWT, rerfreshJWT))
    };

    return await fetchHelper<SuccessfulResponse>(logoutURL, requestInit, successfulResponseMapper);
};

export const fetchConfirmEmail2FA = async (confirmationCode: string, email: string): APIResponse<AuthTokensResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(confirm2FABody(confirmationCode, email))
    };

    return await fetchHelper<AuthTokensResponse>(confirmEmail2FA_URL, requestInit, authTokensResponseMapper);
};

export const fetchConfirmPasswordRecovery2FA = async (confirmationCode: string, email: string): APIResponse<PasswordRecoveryTokenResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(confirm2FABody(confirmationCode, email))
    };

    return await fetchHelper<PasswordRecoveryTokenResponse>(confirmEmail2FA_URL, requestInit, passwordRecoveryTokenResponseMapper);
};

export const fetchIssueNewSecondFactor = async (email: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(emailProvidedBody(email))
    };

    return await fetchHelper<EmailToConfirmResponse>(issueNewSecondFactorURL, requestInit, emailToConfirmResponseMapper);
};

export const fetchChangePassword = async (accessJWT: string, oldPassword: string, newPassword: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePasswordBody(oldPassword, newPassword))
    };

    return await fetchHelper<EmailToConfirmResponse>(requestPasswordRecoveryURL, requestInit, successfulResponseMapper);
};

export const fetchRequestPasswordRecovery = async (email: string): APIResponse<EmailToConfirmResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(emailProvidedBody(email))
    };

    return await fetchHelper<EmailToConfirmResponse>(recoverPasswordURL, requestInit, emailToConfirmResponseMapper);
};

export const fetchRecoverPassword = async (passwordRecoveryToken: string, newPassword: string, newPasswordConfirm: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(passwordRecoveryToken),
        body: JSON.stringify(recoverPasswordBody(newPassword, newPasswordConfirm))
    };

    return await fetchHelper<SuccessfulResponse>(recoverPasswordURL, requestInit, successfulResponseMapper);
};