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
} from "./requestConstructors.ts";

import {
    // Base
    SuccessfullResponse,
    successfullResponseMapper,

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
    userProfileMapper as userProfileResponseMapper
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

export const fetchUsersPosts = async (accessJWT: string, userId: string, page: number): APIResponse<PostsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<PostsResponse>(UserPostsURL(userId, page), requestInit, postsResponseMapper);
}


// Actions with posts

export const fetchMakePost = async (accessJWT: string, title: string, text: string, parent_post_id: string | null = null): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body:    JSON.stringify(makePostBody(title, text, parent_post_id))
    };

    return await fetchHelper<SuccessfullResponse>(basePostURL, requestInit, successfullResponseMapper);
}

export const fetchChangePost = async (accessJWT: string, postId: string, title: string, text: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePostBody(title, text))
    };

    return await fetchHelper<SuccessfullResponse>(specificPostURL(postId), requestInit, successfullResponseMapper);
}

export const fetchDeletePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(specificPostURL(postId), requestInit, successfullResponseMapper);
}

export const fetchLikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestINIT: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(postActionURL(postId), requestINIT, successfullResponseMapper);
}

export const fetchUnlikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfullResponse>(postActionURL(postId), requestInit, successfullResponseMapper);
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

    return await fetchHelper<UserProfileResponse>(specificUserURL(userId), requestInit, userProfileResponseMapper);
}

export const fetchMyProfile = async (accessJWT: string): APIResponse<UserProfileResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<UserProfileResponse>(myProfileURL, requestInit, userProfileResponseMapper);
}

export const fetchFollow = async (accessJWT: string, userId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfullResponse>(followURL(userId), requestInit, userProfileResponseMapper);
}

export const fetchUnfollow = async (accessJWT: string, userId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfullResponse>(followURL(userId), requestInit, userProfileResponseMapper);
}