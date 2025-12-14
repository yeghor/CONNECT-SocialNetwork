export const TokenCookieExpiryHours = 2;
export const AccessTokenCookieKey = "access-token";
export const RefreshTokenCookieKey = "refresh-token";

export const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const UsernameMinLength = 3;
export const UsernameMaxLength = 32;

export const usernameRegexp = /^[\p{L}\p{N}._\-!'`*]{3,32}$/u
export const emailRegexp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
export const passwordRegexp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,}/;

export const maxPostImagesUpload = 3;
export const imageMaxSizeMB = 5;
// Mime types
export const allowedImageExtensions = ["image/jpeg", "image/png", "image/webp"];

export const postTitleMinLength = 3;
export const postTitleMaxLength = 256;
export const postTextMaxLength = 4000;
export const chatMessageMaxLength = 3000;

export const chatMessageSizePX = 72;
export const maxRequestsQueueLength = 30;

export const internalServerErrorURI = "/internal-server-error"
export const appHomeURI = "/";
export const appLoginURI = "/login";
export const appRegisterURI = "/register";
export const myProfileURI = "my-profile";
export const chatsURI = "chats";
export const makeChatURI = (userId: string): string => {
    return `/make-chat/${userId}`;
}
export const unauthorizedRedirectURI = appLoginURI;
export const specificPostURI = (postId: string) => {
    return `/post/${postId}`;
};
export const searchURI = (query: string): string => {
    return `/search?query=${query}`;
};
export const specificChatURI = (chatId: string) => {
    return `/chats/${chatId}`;
}

/*
* Pass me as True and skip userId to get my profile URI
* Pass me as False with userId to get specific user profile URI
*  */
export const specificUserProfileURI = (userId: string) => {
    return `/profile/${userId}`;
};

export const passwordNotSecureEnoughMessage = "Come on, you can do better! Make your password better, longer, stronger, and maybe throw in a ’!’ for flair.";
export const invalidEmailMessage = "That doesn’t look like a valid email. Make sure it includes ’@’ and a domain name.";
export const invalidUsernameMessage = `Keep your username simple! Use ${UsernameMinLength}–${UsernameMaxLength} characters: letters, numbers, or . _ - ! * ' no spaces or fancy symbols.`;
export const manualUnauthorizedMessage = "Unauthorized. Try to login fort.";
export const internalServerErrorDefaultMessage = "It's not you. It's us. Please try again later.";
export const fileIsTooBigMessage = "Whoa there! That file is too big. Try something smaller.";
export const postTitleIsTooSmallMessage = "Title’s too tiny. Give it at least a bit of substance.";
export const postTitleIsTooLargeMessage = "Easy there, Shakespeare. That title is way too long.";
export const postTextIsTooLargeMessage = "Your post is overflowing. Trim it down a little.";
export const tooMuchActivityMessage = "Whoa! You’re smashing that button way too fast. Chill for a sec so we don’t confuse the server.";
export const chatMessageIsTooBigMessage = "That message is a bit long for chat. Maybe trim it down a little?";