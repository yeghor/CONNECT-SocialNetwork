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
    BadResponseDTO,
    isBadResponse,
    AuthResponseDTO,
    AuthTokensResponse,
    authTokensResponseMapper,
} from "./responseDTO.ts"

export const fetchLogin = async (username: string, password: string): Promise<(AuthTokensResponse & {success: true})|(BadResponseDTO & {success: false})> => {
    console.log(loginURL)
    const response = await fetch(loginURL,
        {
            method: "POST",
            headers: requestHeaders(),
            body: JSON.stringify(loginBody(username, password))
        }
    );
    // Do something wit type crossing
    const responseDTO: AuthResponseDTO | BadResponseDTO = await response.json();
    if (isBadResponse(responseDTO)) {
        return responseDTO;
    } else {
        return authTokensResponseMapper(responseDTO);
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