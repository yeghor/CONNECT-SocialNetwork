import {
    loginURL,
    registerURL,
    logoutURL,
    refreshTokenURL,
    changePasswordURL,
    changeUsernameURL,
} from "./urls";

import { 
    requestTokenHeaders,
    requestHeaders,
    loginBody,
    registerBody, 
} from "./requestConstructors"

import {
    badResponseMapper,
    BadResponse,
    AuthResponseDTO,
    AuthTokensResponse,
    authTokensResponseMapper,
} from "./responseDTO"

export const fetchLogin = async (username: string, password: string): Promise<AuthTokensResponse|BadResponse> => {
    const response = await fetch(loginURL,
        {
            method: "POST",
            headers: requestHeaders(),
            body: JSON.stringify(loginBody(username, password))
        }
    );
    // Do something wit type crossing
    const responseDTO: AuthResponseDTO & BadResponse = await response.json();
    if (response.ok) {
        return authTokensResponseMapper(responseDTO);
    } else {
        return badResponseMapper(responseDTO.detail, responseDTO.statusCode);
    }
}

export const fetchRegister = async (username: string, email: string, password: string): Promise<void> => {
    await fetch(loginURL,
        {
            method: "POST",
            headers: requestHeaders(),
            body: JSON.stringify(registerBody(username=username, email=email, password=password))
        }
    );
}