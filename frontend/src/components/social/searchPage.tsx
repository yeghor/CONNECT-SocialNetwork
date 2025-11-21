import React from "react";

import { fetchSearchPosts, fetchSearchUsers } from "../../fetching/fetchSocial"
import { safeAPICall } from "../../fetching/fetchUtils"
import {
    FeedPost,
    FeedPostsResponse,
    ShortUserProfile,
    ShortUserProfilesResponse
} from "../../fetching/responseDTOs"
import { useSearchParams } from "react-router";

import FlowPost from "./post/flowPost.tsx"
import FlowUser from "./post/flowUser.tsx"
import estimatePostSize from "../../helpers/postSizeEstimator.ts";

import { CookieTokenObject } from "../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import { arrayShuffle } from "array-shuffle";

interface SearchResultPost {
    estimateSize: number;
    type: "post";
    data: FeedPost
}
interface SearchResultUser {
    estimateSize: number;
    type: "user";
    data: ShortUserProfile;
}


type SearchFilter = "both" | "posts" | "users";

const getSearchResults = async (tokens: CookieTokenObject, navigate: NavigateFunction, page: number, filter: SearchFilter): Promise<(SearchResultUser | SearchResultPost)[] | undefined> => {
    let fetchFunctions: CallableFunction[];

    switch (filter) {
        case "both":
            fetchFunctions = [fetchSearchPosts, fetchSearchUsers];
            break;
        case "posts":
            fetchFunctions = [fetchSearchPosts];
            break;
        case "users":
            fetchFunctions = [fetchSearchUsers];

        let fetchedResults: (FeedPost | ShortUserProfile)[] = [];
        for (let fetcherFunction of fetchFunctions) {
            const response = await safeAPICall<FeedPostsResponse | ShortUserProfilesResponse>(tokens, fetcherFunction, navigate, undefined, page)
            if (response.success) {
                fetchedResults.concat(response.data);
            } else {
                return undefined;
            }
        }

        fetchedResults = arrayShuffle(fetchedResults);

        return fetchedResults.map((elem) => {
            if ((elem as FeedPost).postId !== undefined) {
                elem = elem as FeedPost;

                let estimateSize: number = estimatePostSize(elem.picturesURLs.length, elem.isReply);

                return {
                    estimateSize: estimateSize,
                    type: "post",
                    data: elem
                };
            } else {
                elem = elem as ShortUserProfile;
                return {
                    estimateSize: 250,
                    type: "user",
                    data: elem
                };
            }
        })
    }
}

// Initial page - 1
const SearchPage = () => {
    const [ searchParams ] = useSearchParams();
    const query = searchParams.get("query");

    return(
        <div></div>
    );
};

export default SearchPage;
