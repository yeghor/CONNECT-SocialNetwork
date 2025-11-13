import {
    usernameRegexp, emailRegexp, passwordRegexp,
    UsernameMinLength, UsernameMaxLength,
    imageMaxSizeMB, allowedImageExtensions,
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