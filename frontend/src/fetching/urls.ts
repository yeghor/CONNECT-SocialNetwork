import {OrderPostsByFlag, ProfilePostsSectionFlag} from "../components/social/profilePage.tsx";

const MAINHTTPPROTOCOL = "http://"
const WSPROTOCOL = "ws://"
const HOST = "127.0.0.1:8000"

const BASEURL = `${MAINHTTPPROTOCOL}${HOST}`

export const createWebSocketURL = (token: string): string=> {
    return `${WSPROTOCOL}${HOST}/${token}`;
};

// Constructors
const usersConstructor = "/users";
const myProfileConstructor = "/my-profile";
const postsConstructor = "/posts";
const searchConstructor = '/search';
const commentsConstructor = "/comments"
const chatConstructor = "/chat";
const mediaConstructor = "/media";
const repliesConstructor = "/replies";
const authConstructor = "/auth"
const _2FAConstructor = "/2fa"

// Auth

export const loginURL = `${BASEURL}/login`;
export const registerURL = `${BASEURL}/register`;
export const logoutURL = `${BASEURL}/logout`;

export const refreshTokenURL = `${BASEURL}/refresh`;

export const changeUsernameURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/username`;
export const changePasswordURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/password`;

export const requestPasswordRecoveryURL = `${BASEURL}${authConstructor}/password-recovery`;
export const recoverPasswordURL = `${BASEURL}${authConstructor}/password-recovery`;

export const myProfileURL = `${BASEURL}${usersConstructor}${myProfileConstructor}`;

export const recentActivityURL = `${BASEURL}/recent-activity`;

export const myFriendsURL = `${BASEURL}/friends`;

export const confirmEmail2FA_URL = `${BASEURL}${authConstructor}${_2FAConstructor}/confirm-email`;
export const confirmPasswordRecovery2FA_URL = `${BASEURL}${authConstructor}${_2FAConstructor}/password-recovery`;

export const issueNewSecondFactorURL = `${BASEURL}${authConstructor}/new${_2FAConstructor}`;

//Social

export const basePostURL = `${BASEURL}${postsConstructor}`;

export const likePostActionURL = (postId: string) => {
    return `${BASEURL}${postsConstructor}/${postId}/like`;
};

export const specificPostURL = (postId: string) => {
    return `${BASEURL}${postsConstructor}/${postId}`;
};

// Page specified required
export const postsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/feed/${page}`;
};

export const followedPostsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/following/${page}`;
};

export const searchPostsURL = (query: string, page: number | string) => {
    return `${BASEURL}${searchConstructor}${postsConstructor}/${page}?query=${query}`;
};

export const searchUsersURL = (query: string, page: number | string) => {
    return `${BASEURL}${searchConstructor}${usersConstructor}/${page}?query=${query}`;
};

export const postCommentsURL = (postId: string, page: number | string) => {
    return `${BASEURL}${postsConstructor}/${postId}${commentsConstructor}/${page}`;
};

export const userPostsURL = (userId: string, page: number | string, type: ProfilePostsSectionFlag, order: OrderPostsByFlag) => {
    return `${BASEURL}${usersConstructor}/${userId}${postsConstructor}/${page}?posts_type=${type}&order=${order}`;
};

export const specificUserURL = (userId: string) => {
    return `${BASEURL}${usersConstructor}/${userId}`;
};

export const followURL = (userId: string) => {
    return `${BASEURL}${usersConstructor}/${userId}/follow`;
};

// Media

export const uploadPostImageURL = (postId: string) => {
    return `${BASEURL}${mediaConstructor}${postsConstructor}/${postId}`;
};

export const uploadAvatarURL = `${BASEURL}${mediaConstructor}${myProfileConstructor}/avatar`;


// Chat

export const chatConnectURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/connect/${chatId}`;
};

export const pendingChatConnectURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/not-approved/connect/${chatId}`;
};

export const isChatPendingURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/is-approved/${chatId}`;
};

export const chatMessages = (chatId: string, page: number | string) => {
    return `${BASEURL}${chatConstructor}/${chatId}/messages/${page}`;
};

export const dialogueChatURL = `${BASEURL}${chatConstructor}/dialogue`;
export const groupChatURL = `${BASEURL}${chatConstructor}/group`;

export const chatInitiatedByMeURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/not-approved/initiated-by-me/${chatId}`;
} 

export const chatsURL = (page: number | string) => {
    return `${BASEURL}${chatConstructor}/approved/${page}`;
};

export const batchChatMessagesURL = (chatId: string, page: number | string) => {
    return `${BASEURL}${chatConstructor}/${chatId}/messages/${page}`;
};

export const notApprovedChatsURL = (page: number | string) => {
    return `${BASEURL}${chatConstructor}/not-approved/${page}`;
};

export const approveChatURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/approve/${chatId}`;
};

export const getDialoqueIdURL = (otherUserId: string) => {
    return `${BASEURL}${chatConstructor}/id/${otherUserId}`;
};

export const leaveFromChatURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/leave/${chatId}`;
};

export const notApprovedChatsAmountURL = `${BASEURL}${chatConstructor}/not-approved`