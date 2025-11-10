export const TokenCookieExpiryHours: number = 2;
export const AccessTokenCookieKey = "access-token";
export const RefreshTokenCookieKey = "refresh-token";

export const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const UsernameMinLength = 3;
export const UsernameMaxLength = 32;

export const usernameRegexp = /^[\p{L}\p{N}._\-!'`*]{3,32}$/u
export const emailRegexp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
export const passwordRegexp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/;


export const internalServerErrorURI = "/internal-server-error"
export const appHomeURI = "/";
export const appLoginURI = "/login";
export const appRegisterURI = "/register";
export const unauthorizedRedirectURI = appLoginURI;
export const specificPostURI = (postId: string): string => {
    return `/post/${postId}`;
};

export const passwordNotSecureEnoughMessage = "Come on, you can do better! Make your password better, longer, stronger, and maybe throw in a ’!’ for flair.";
export const invalidEmailMessage = "That doesn’t look like a valid email. Make sure it includes ’@’ and a domain name.";
export const invalidUsernameMessage = `Keep your username simple! Use ${UsernameMinLength}–${UsernameMaxLength} characters: letters, numbers, or . _ - ! * ' no spaces or fancy symbols.`;
export const manualUnauthorizedMessage = "Unauthorized. Try to login fort.";
export const internalServerErrorDefaultMessage = "It's not you. It's us. Please try again later.";