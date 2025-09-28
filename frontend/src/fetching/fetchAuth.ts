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
} from "./requestConstructors.ts"

import {
    BadResponse,
    isBadResponse,
    AuthResponseDTO,
    AuthTokensResponse,
    authTokensResponseMapper,
    AccesTokenResponse,
    AccessTokenDTO,
    accesTokenResponseMapper,
} from "./responseDTO.ts"

type APIResponse<R> = Promise<R & {success: true} | BadResponse & {success: false}>

const fetchHelper = async <ResponseType>(requestURL: string, requestInit: RequestInit, DTOMapper: CallableFunction): Promise<ResponseType | BadResponse> => {
    const response = await fetch(requestURL, requestInit);
    const responseDTO = await response.json();

    if(isBadResponse(responseDTO)) {
        return responseDTO;
    } else {
        return DTOMapper(responseDTO);
    }
}

export const fetchLogin = async (username: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(loginBody(username, password))
    };

    return await fetchHelper<AuthTokensResponse>(loginURL, requestInit, authTokensResponseMapper);
}

export const fetchRegister = async (username: string, email: string, password: string): APIResponse<AuthTokensResponse> => {
    const requestInit = {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify(registerBody(username, email, password))
    };

    return await fetchHelper<AuthTokensResponse>(registerURL, requestInit, authTokensResponseMapper);
}

export const fetchRefresh = async (refreshJWT: string): APIResponse<AccesTokenResponse> => {
    const requestInit = {
        method: "POST",
        headers: requestTokenHeaders(refreshJWT),
    };

    return await fetchHelper<AccesTokenResponse>(refreshTokenURL, requestInit, authTokensResponseMapper);
}