export const BASEURL = "http://0.0.0.0:8000"

// Constructors
const usersConstructor = "/users";
const myProfileConstructor = "/my-profile";
const postsConstructor = "/posts";
const searchConstructor = '/search';
const commentsConstructor = "/comments"

// Auth

export const loginURL = "/login";
export const registerURL = "/register";
export const logoutURL = "/logout";

export const refreshTokenURL = "/refresh";

export const changeUsernameURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/username`
export const changePasswordURL = `${BASEURL}${usersConstructor}${myProfileConstructor}/password`

export const myProfileURL = `${BASEURL}${usersConstructor}${myProfileConstructor}`

//Social

export const postsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/feed/${page}`;
}

export const followedPostsFeedURL = (page: number | string) => {
    return `${BASEURL}${postsConstructor}/following/${page  }`;
}

export const searchPostsURL = (page: number | string) => {
    return `${BASEURL}${searchConstructor}${postsConstructor}/${page}`;
}

export const searchUsersURL = (page: number | string) => {
    return `${BASEURL}${searchConstructor}${usersConstructor}/${page}`;
}

export const postCommentsURL = (postId: string, page: number | string) => {
    return `${BASEURL}${postsConstructor}/${postId}/${commentsConstructor}/${page}`;
}


