const MAINHTTPPROTOCOL = "http://"
const WSPROTOCOL = "ws://"
const HOST = "localhost:8000"

const BASEURL = `${MAINHTTPPROTOCOL}${HOST}`

export const WebSocketURL = `${WSPROTOCOL}${HOST}`

// Constructors
const usersConstructor = "/users";
const myProfileConstructor = "/my-profile";
const postsConstructor = "/posts";
const searchConstructor = '/search';
const commentsConstructor = "/comments"
const chatConstructor = "/chat";
const mediaConstructor = "/media";

// Auth

export const loginURL = `${BASEURL}/login`;
export const registerURL = `${BASEURL}/register`;
export const logoutURL = `${BASEURL}/logout`;

export const refreshTokenURL = "/refresh";

export const changeUsernameURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/username`;
export const changePasswordURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/password`;

export const myProfileURL = `${BASEURL}${usersConstructor}${myProfileConstructor}`;

//Social

export const basePostURL = `${BASEURL}${postsConstructor}`;

export const postActionURL = (postId: string) => {
    return `${BASEURL}${postsConstructor}/${postId}/like`;
}

export const specificPostURL = (postId: string) => {
    return `${BASEURL}${postsConstructor}/${postId}`;
}

// Page specified required
export const postsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/feed/${page}`;
}

export const followedPostsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/following/${page}`;
}

export const searchPostsURL = (prompt: string, page: number | string) => {
    return `${BASEURL}${searchConstructor}${postsConstructor}/${page}?prompt=${prompt}`;
}

export const searchUsersURL = (prompt: string, page: number | string) => {
    return `${BASEURL}${searchConstructor}${usersConstructor}/${page}?prompt=${prompt}`;
}

export const postCommentsURL = (postId: string, page: number | string) => {
    return `${BASEURL}${postsConstructor}/${postId}/${commentsConstructor}/${page}`;
}

export const UserPostsURL = (userId: string, page: number | string) => {
    return `${BASEURL}${usersConstructor}/${userId}${postsConstructor}/${page}`;
}

export const BatchChatMessagesURL = (chatId: string, page: number | string) => {
    return `${BASEURL}${chatConstructor}/${chatId}/messages/${page}`;
}

export const ChatsURL = (page: string | number) => {
    return `${BASEURL}${chatConstructor}/${page}`;
}

export const specificUserURL = (userId: string) => {
    return `${BASEURL}${usersConstructor}/${userId}`;
}

export const followURL = (userId: string) => {
    return `${BASEURL}${usersConstructor}/${userId}/follow`;
}

// Media

export const uploadPostImageURL = (postId: string) => {
    return `${BASEURL}${mediaConstructor}${postsConstructor}/${postId}`;
}

export const uploadUserImageURL = `${BASEURL}${mediaConstructor}${usersConstructor}`;


// Chat

export const chatConnectURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/${chatId}`;
}

export const chatMessages = (chatId: string, page: number | string) => {
    return `${BASEURL}${chatConstructor}/${chatId}/messages/${page}`;
}

export const dialoqueChatURL = `${BASEURL}${chatConstructor}/dialogue`;

export const groupChatURL = `${BASEURL}${chatConstructor}/group`;

export const chatURL = (page: number | string) => {
    return `${BASEURL}${chatConstructor}/${page}`;
}

export const notApprovedChatsURL = (page: number | string) => {
    return `${BASEURL}${chatConstructor}/not-approved/${page}`;
}

export const approveChatURL = (chatId: string) => {
    return `${BASEURL}${chatConstructor}/approve/${chatId}`;
}