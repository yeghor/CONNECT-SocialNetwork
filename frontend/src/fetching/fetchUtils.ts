import {
    BadResponse,
    isBadResponse,
    badResponseMapper, UserProfileResponse
} from "./responseDTOs.ts"

// & Types Intersection
// If object type {success: false} intersects with BadResponse *(which has that exactly field)* - function return type will be BadResponse
export type APIResponse<R> = Promise<R & {success: true} | BadResponse & {success: false}>
export type APIResponseResolved<R> = R & {success: true} | BadResponse & {success: false}

export const fetchHelper = async <ResponseType>(requestURL: string, requestInit: RequestInit, DTOMapper: CallableFunction): Promise<ResponseType | BadResponse> => {
    const response = await fetch(requestURL, requestInit);
    const responseDTO = await response.json();

    if(isBadResponse(responseDTO)) {
        return badResponseMapper(responseDTO, response.status);
    } else {
        return DTOMapper(responseDTO);
    }
}

export const safeAPICall = async () => {

};