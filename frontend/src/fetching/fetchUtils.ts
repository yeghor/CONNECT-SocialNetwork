import {
    BadResponse,
    isBadResponse,
    badResponseMapper
} from "./responseDTOs.ts"

// & Types Intersection
// If object type {succes: fasle} intersepts with BadResponse *(which has that exactly field)* - function return type will be BadResponse
export type APIResponse<R> = Promise<R & {success: true} | BadResponse & {success: false}>

export const fetchHelper = async <ResponseType>(requestURL: string, requestInit: RequestInit, DTOMapper: CallableFunction): Promise<ResponseType | BadResponse> => {
    const response = await fetch(requestURL, requestInit);
    const responseDTO = await response.json();

    if(isBadResponse(responseDTO)) {
        return badResponseMapper(responseDTO, response.status);
    } else {
        return DTOMapper(responseDTO);
    }
}