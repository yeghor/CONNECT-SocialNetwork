import {
    usernameRegexp, emailRegexp, passwordRegexp,
    UsernameMinLength, UsernameMaxLength,
    imageMaxSizeMB, allowedImageMimeTypes,
    postTextMaxLength, postTitleMaxLength, postTitleMinLength, postTitleIsTooLargeMessage, postTitleIsTooSmallMessage,
    postTextIsTooLargeMessage
} from "../consts.ts"

type stringType = "username" | "email" | "password";

export const validateFromString = (formString: string, stringType: stringType): boolean => {
    switch (stringType) {
        case "username": 
            if (usernameRegexp.test(formString)) {
                return true;
            }
            break;
        case "email":
            if (emailRegexp.test(formString)) {
                return true;
            }
            break;
        case "password":
            if (passwordRegexp.test(formString)) {
                return true;
            }
        }
    return false;
}

export const imageValidator = (file: File): boolean => {
    const fileSizeMB = file.size / 1024 / 1024;
    return true;
}

interface RawPostData {
    title: string;
    text: string;
}

/* Returns error message if validation error */
export const validateMakePost = (rawPostData: RawPostData): string | undefined => {
    if (rawPostData.title.length < postTitleMinLength) {
        return postTitleIsTooSmallMessage;
    } else if (rawPostData.title.length > postTitleMaxLength) {
        return postTitleIsTooLargeMessage;
    } else if (rawPostData.text.length > postTextMaxLength) {
        return postTextIsTooLargeMessage;
    }

    return undefined;
}