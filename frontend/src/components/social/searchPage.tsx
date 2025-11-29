import React, { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {infiniteQueryOptions, useInfiniteQuery} from "@tanstack/react-query";

import { fetchSearchPosts, fetchSearchUsers } from "../../fetching/fetchSocial"
import { safeAPICall } from "../../fetching/fetchUtils"
import {
    FeedPost,
    FeedPostsResponse,
    ShortUserProfile,
    ShortUserProfilesResponse
} from "../../fetching/responseDTOs"
import {useNavigate, useSearchParams} from "react-router";

import FlowPost from "./post/flowPost.tsx"
import FlowUser from "./post/flowUser.tsx"
import estimatePostSize from "../../helpers/postSizeEstimator.ts";

import {CookieTokenObject, getCookiesOrRedirect} from "../../helpers/cookies/cookiesHandler.ts";
import { NavigateFunction } from "react-router-dom";
import { arrayShuffle } from "array-shuffle";
import OwnerComponent from "./post/owner.tsx";

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

type SearchData = (SearchResultPost | SearchResultUser)[];

type SearchFilter = "both" | "posts" | "users";

const getSearchResults = async (tokens: CookieTokenObject, navigate: NavigateFunction, query: string, page: number, filter: SearchFilter): Promise<SearchData | undefined> => {
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
    }

    let fetchedResults: (FeedPost | ShortUserProfile)[] = [];
    for (let fetcherFunction of fetchFunctions) {
        const response = await safeAPICall<FeedPostsResponse | ShortUserProfilesResponse>(tokens, fetcherFunction, navigate, undefined, query, page)
        if (response.success) {
            fetchedResults = fetchedResults.concat(response.data);
        } else {
            return undefined;
        }
    }

    return fetchedResults.map((elem) => {
        if ("postId" in elem) {
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
                estimateSize: 300,
                type: "user",
                data: elem
            };
        }
    })
}

const createSearchInfiniteQueryOptions = (tokens: CookieTokenObject, navigate: NavigateFunction, query: string,  filter: SearchFilter) => {
    return infiniteQueryOptions({
        queryKey: ["search", filter, query],
        queryFn: ({pageParam}) => getSearchResults(tokens, navigate, query, pageParam, filter),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
            if (lastPage) {
                if (!lastPage || lastPage.length === 0) {
                    return undefined;
                }
                return lastPageParam + 1;
            } else {
                return undefined;
            }
        }
    })
}

// Initial page - 1
const SearchPage = () => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ filter, setFilter ] = useState<SearchFilter>("both");

    const [ searchParams ] = useSearchParams();
    let query = searchParams.get("query");
    if (query === null) query = "";

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createSearchInfiniteQueryOptions(tokens, navigate, query, filter));
    const scrollRef = useRef<HTMLDivElement>(null);

    const searchData = (data?.pages.flatMap((page => page)) ?? []).filter((elem) => elem !== undefined);

    const virtualizer = useVirtualizer({
        count: searchData?.length ?? 0,
        estimateSize: (index) => {
            const elem = searchData[index]
            return elem?.estimateSize ?? 0
        },
        getScrollElement: () => scrollRef.current,
        overscan: 48
    });

    const virtualItems= virtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!hasNextPage || isFetchingNextPage || !lastItem) return;
        if (lastItem.index >= searchData.length - 1)
        fetchNextPage();
    }, [virtualItems, hasNextPage, fetchNextPage]);

    const changeFilter = (newFilter: SearchFilter): void => {
        if (newFilter !== filter) {
            setFilter(newFilter);
        }
    };


    return(
        <div>
            <div className="flex justify-center gap-4 text-white w-2/3 mx-auto m-6">
                <button
                    className={`px-4 py-2 rounded-3xl ${
                        filter !== "both" ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                    }`}
                    onClick={() => { changeFilter("both"); }}
                >
                    Both
                </button>
                <button
                    className={`px-4 py-2 rounded-3xl ${
                        filter !== "users" ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                    }`}
                    onClick={() => { changeFilter("users"); }}
                >
                    Users
                </button>
                <button
                    className={`px-4 py-2 rounded-3xl ${
                        filter !== "posts" ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                    }`}
                    onClick={() => { changeFilter("posts"); }}
                >
                    Posts
                </button>
            </div>
            <div ref={scrollRef} className="mx-auto w-2/3 mb-16 h-[800px] overflow-y-auto flex flex-col gap-4">
                <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                    { virtualItems.map((vItem,) => {
                        const elem = searchData[vItem.index];
                        let uniqueIdentifier: string;

                        if (!elem || !elem.data) return null;
                        let Component;
                        if (elem.type === "post") {
                            elem.data = elem.data as FeedPost;
                            // Setting isMyPost false by default, because user cannot modify or delete post on search page
                            Component = (<FlowPost postData={elem.data} isMyPost={false} />);
                            uniqueIdentifier = elem.data.postId
                        } else {
                            elem.data = elem.data as ShortUserProfile;
                            Component = (<FlowUser userData={elem.data} />);
                            uniqueIdentifier = elem.data.userId
                        }

                        return (
                            <div
                                key={vItem.key + uniqueIdentifier}
                                style={{
                                    transform: `translateY(${vItem.start})px`,
                                    height: `${vItem.size}px`}}
                                className="top-0 left-0 w-full"
                            >
                                <div className="m-4">
                                    {Component}
                                </div>
                            </div>
                        )
                    }) }
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
