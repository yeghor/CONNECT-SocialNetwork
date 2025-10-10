import {
    usernameRegexp, emailRegexp, passwordRegexp,
    UsernameMinLength, UsernameMaxLength,
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
