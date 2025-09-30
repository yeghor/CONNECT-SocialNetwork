import { fetchHelper, APIResponse } from "./fetchUtils.ts"

import {
    uploadPostImageURL,
    uploadUserImageURL,
 } from "./urls.ts"

import {
    SuccessfullResponse,
    successfullResponseMapper,

} from "./responseDTOs.ts"

import {
    requestTokenMultipartHeaders
} from "./requestConstructors.ts"

export const fetchUploadAvatar = async (accessJWT: string, imageData: Blob): APIResponse<SuccessfullResponse> => {
    const formData = new FormData();
    formData.append("file_", imageData);

    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenMultipartHeaders(accessJWT),
        body: formData
    };

    return await fetchHelper<SuccessfullResponse>(uploadUserImageURL, requestInit, successfullResponseMapper);
}

export const fetchUploadPostPictures = async (accessJWT: string, postId: string, imageData: Blob): APIResponse<SuccessfullResponse> => {
    const formData = new FormData();
    formData.append("file_", imageData);

    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenMultipartHeaders(accessJWT),
        body: formData
    };

    return await fetchHelper<SuccessfullResponse>(uploadPostImageURL(postId), requestInit, successfullResponseMapper);
}

