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
    likePostActionURL,
    followURL,
    specificUserURL,
    userPostsURL,
    recentActivityURL,
    myFriendsURL
} from "./urls.ts";

import {
    requestTokenHeaders,
    makePostBody,
    changePostBody,
} from "./requestConstructors.ts";

import {
    // Base
    SuccessfulResponse,
    successfulResponseMapper,

    // Posts
    LoadPostResponse,
    loadPostResponseMapper as loadPostResponseMapper,
    PostCommentsResponse,
    postCommentsResponseMapper,
    FeedPostsResponse as PostsResponse,
    feedPostResponseMapper as postsResponseMapper,
    RecentActivityResponse, recentActivityMapper,

    // Users
    ShortUserProfilesResponse,
    UserProfileResponse,
    shortUserProfilesMapper,
    userProfileMapper as userProfileResponseMapper, PostBaseResponse, postBaseMapper
} from "./responseDTOs.ts";
import { OrderPostsByFlag, ProfilePostsSectionFlag } from "../components/social/profilePage.tsx";

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

export const fetchUsersPosts = async (accessJWT: string, userId: string, type: ProfilePostsSectionFlag, order: OrderPostsByFlag, page: number): APIResponse<PostsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<PostsResponse>(userPostsURL(userId, page, type, order), requestInit, postsResponseMapper);
}

// Actions with posts

export const fetchMakePost = async (accessJWT: string, title: string, text: string, parent_post_id: string | null = null): APIResponse<PostBaseResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(makePostBody(title, text, parent_post_id))
    };

    return await fetchHelper<PostBaseResponse>(basePostURL, requestInit, postBaseMapper);
}

export const fetchChangePost = async (accessJWT: string, postId: string, title: string, text: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "PATCH",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(changePostBody(title, text))
    };

    return await fetchHelper<SuccessfulResponse>(specificPostURL(postId), requestInit, successfulResponseMapper);
}

export const fetchDeletePost = async (accessJWT: string, postId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfulResponse>(specificPostURL(postId), requestInit, successfulResponseMapper);
}

export const fetchLikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfulResponse> => {
    const requestINIT: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfulResponse>(likePostActionURL(postId), requestINIT, successfulResponseMapper);
}

export const fetchUnlikePost = async (accessJWT: string, postId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper<SuccessfulResponse>(likePostActionURL(postId), requestInit, successfulResponseMapper);
}

// User Interactions

export const fetchSearchUsers = async (accessJWT: string, prompt: string, page: number): APIResponse<ShortUserProfilesResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ShortUserProfilesResponse>(searchUsersURL(prompt, page), requestInit, shortUserProfilesMapper);
}

export const fetchSpecificUserProfile = async (accessJWT: string, userId: string): APIResponse<UserProfileResponse> => {
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

export const fetchFollow = async (accessJWT: string, userId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfulResponse>(followURL(userId), requestInit, successfulResponseMapper);
}

export const fetchUnfollow = async (accessJWT: string, userId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "DELETE",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfulResponse>(followURL(userId), requestInit, successfulResponseMapper);
}

export const fetchRecentActivity = async (accessJWT: string): APIResponse<RecentActivityResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    }

    return await fetchHelper<RecentActivityResponse>(recentActivityURL, requestInit, recentActivityMapper);
}

export const fetchMyFriends = async (accessJWT: string): APIResponse<ShortUserProfilesResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    }

    return await fetchHelper<ShortUserProfilesResponse>(myFriendsURL, requestInit, shortUserProfilesMapper);
}