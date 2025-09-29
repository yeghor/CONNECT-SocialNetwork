import {
    APIResponse,
    fetchHelper
} from "./fetchUtils.ts"

import {
    myProfileURL,
    postsFeedURL,
    followedPostsFeedURL,
    searchPostsURL,
    searchUsersURL,
    // Create post
    basePostURL,
    // Load post / change post / delete post
    specificPostURL,
    postCommentsURL,
    postActionURL,
    followURL,
    specificUserURL,
    UserPostsURL,
} from "./urls.ts";

import {
    requestTokenHeaders,
    makePostBody,
    changePostBody,
    changePasswordBody,
} from "./requestConstructors.ts";

import {
    // Base
    SuccessfullResponse,
    succesfullResponseCreator as succesfullResponseMapper,
    BadResponse,
    badResponseMapper,

    // Posts
    LoadPostResponse,
    loadPostResponseMapper as loadPostResponseMapper,
    PostCommentsResponse,
    postCommentsResponseMapper,
    FeedPostsResponse as PostsResponse,
    feedPostResponseMapper as postsResponseMapper,
 
    // Users
    ShortUserProfilesResponse,
    UserProfileResponse,
    userShortProfilesMapper,
    userProfileMapper
} from "./responseDTOs.ts";

// Get Posts

export const fetchFeedPosts = async (accessJWT: string, page: number): APIResponse<PostsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper(postsFeedURL(page), requestInit, postsResponseMapper);
}

export const fetchFollowedPosts = async (accessJWT: string, page: number): APIResponse<PostsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<PostsResponse>(followedPostsFeedURL(page), requestInit, postsResponseMapper);
}

export const fetchPostComments = async (accessJWT: string, postId: string, page: number): APIResponse<PostCommentsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<PostCommentsResponse>(postCommentsURL(postId, page), requestInit, postCommentsResponseMapper);
}

export const fetchLoadPost = async (accessJWT: string, postId: string): APIResponse<LoadPostResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<LoadPostResponse>(specificPostURL(postId), requestInit, loadPostResponseMapper);
}

export const fetchSearchPosts = async (accessJWT: string, prompt: string, page: number): APIResponse<PostsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<PostsResponse>(searchPostsURL(prompt, page), requestInit, postsResponseMapper);
}

// Actions with posts

export const fetchMakePost = async (accessJWT: string, title: string, text: string, parent_post_id: string | null = null): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body:    JSON.stringify(makePostBody(title, text, parent_post_id))
    };

    return await fetchHelper<SuccessfullResponse>(basePostURL, requestInit, succesfullResponseMapper);
}

export const fetchChangePost = async (accessJWT: string, postId: string, title: string, text: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePostBody(title, text))
    };

    return await fetchHelper<SuccessfullResponse>(specificPostURL(postId), requestInit, succesfullResponseMapper);
}

export const fetchDeletePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(specificPostURL(postId), requestInit, succesfullResponseMapper);
}

export const fetchLikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestINIT: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(postActionURL(postId), requestINIT, succesfullResponseMapper);
}

export const fetchUnlikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(postActionURL(postId), requestInit, succesfullResponseMapper);
}

// User Interactions

export const fetchSearchUsers = async (accessJWT: string, prompt: string, page: number): APIResponse<ShortUserProfilesResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ShortUserProfilesResponse>(searchUsersURL(prompt, page), requestInit, userShortProfilesMapper);
}

export const fetchSpecificUser = async (accessJWT: string, userId: string): APIResponse<UserProfileResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<UserProfileResponse>(specificUserURL(userId), requestInit, userProfileMapper);
}