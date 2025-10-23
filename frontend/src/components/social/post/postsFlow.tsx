import React, {useEffect, useRef, useState} from "react";
import { queryClient } from "../../../index.tsx";

import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import ShortPostComponent from "./post.tsx";

import { fetchFeedPosts, fetchFollowedPosts } from "../../../fetching/fetchSocial.ts";


import {
    getCookiesOrRedirect,
    CookieTokenObject
} from "../../../helpers/cookies/cookiesHandler.ts";


import {FeedPostResponse, FeedPostsResponse} from "../../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import {
    checkUnauthorizedResponse,
    retryUnauthorizedResponse,
    validateResponse
} from "../../../helpers/responseHandlers/getResponseHandlers.ts";
import {NavigateFunction} from "react-router-dom";
import {internalServerErrorURI, unauthorizedRedirectURI} from "../../../consts.ts";
import {APIResponseResolved} from "../../../fetching/fetchUtils.ts";

const postFetcher = async (tokens: CookieTokenObject, page: number, feed: boolean, navigate: NavigateFunction) => {
    if(tokens.access) {
        console.log("Fetching post...");
        console.log(tokens.access);

        let fetchedPosts: APIResponseResolved<FeedPostsResponse>;

        if (feed) {
            fetchedPosts = await fetchFeedPosts(tokens.access, page);
        } else {
            fetchedPosts = await fetchFollowedPosts(tokens.access, page);
        }

        if(!validateResponse(fetchedPosts)) {
            navigate(internalServerErrorURI);
            return fetchedPosts;
        }

        if(tokens.refresh && tokens.refresh && checkUnauthorizedResponse(fetchedPosts)) {
            const fetchFunc = feed ? fetchFeedPosts : fetchFollowedPosts;
            return await retryUnauthorizedResponse<FeedPostsResponse>(fetchFunc, tokens.refresh, navigate, undefined, page);
        }

        return fetchedPosts;
    }
}

function createPostsInfiniteQueryOptions(tokens: CookieTokenObject, feed: boolean, navigate: NavigateFunction) {
    if(!tokens.access || !tokens.refresh) {
        navigate(unauthorizedRedirectURI);
    }

    return infiniteQueryOptions({
        queryKey: ["posts", feed],
        queryFn: ({ pageParam = 0 }) => postFetcher(tokens, pageParam, feed, navigate),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
            if (lastPage && lastPage.success) {
                if (!lastPage || lastPage.data.length === 0) {
                    return undefined;
                }
                return lastPageParam + 1;
            } else {
                return undefined;
            }
        }
    });
}

// Base Home page with posts
const PostsFlow = () => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);
    const [ feed, setFeed ] = useState(true);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createPostsInfiniteQueryOptions(tokens, feed, navigate));
    const [ posts, setPosts ] = useState<FeedPostResponse[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: posts?.length ?? 0,
        estimateSize: (index) => {
            const post = posts[index];
            if(!post) return 200;
            return (post.picturesURLs.length > 0 ? 600 : 200) + 32
        },
        getScrollElement: () => scrollRef.current
    });
    const virtualItems = virtualizer.getVirtualItems();


    const infiniteQuerying = async () => {
        const flatMapPosts = data?.pages.flatMap((page) => {if(page && page.success) { return page.data; }}).filter((post) => post !== undefined) ?? []
        setPosts(flatMapPosts);

        const lastItem = virtualItems[virtualItems.length - 1];
        if (!hasNextPage || isFetchingNextPage || !lastItem) return;
        if (lastItem.index >= posts.length - 1) await fetchNextPage();
    }

    useEffect(() => {
        queryClient.clear();
    }, [feed, setFeed]);

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, feed]);

    const toggleFeed = () => {
        setFeed(!feed);
    }

    return (
        <div className="m-16">
            <div className="max-w-lg mx-auto">
                <div className="flex justify-center gap-2 mb-4 text-white text-medium" onClick={toggleFeed}>
                    <button
                        className={`px-4 py-2 rounded-lg ${
                            !feed ? "bg-white/30" : "bg-white/50"
                        }`}
                    >
                        Feed
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg ${
                            feed ? "bg-white/30" : "bg-white/50"
                        }`}
                    >
                        Followed
                    </button>
                </div>
            </div>
            
            <div ref={scrollRef} className="h-[80vh] overflow-auto relative max-w-lg mx-auto border-gray-300">
                <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                    {
                        virtualItems.map((vItem) => {
                            const post = posts[vItem.index];
                            return (
                                <div key={vItem.key} className="absolute top left-0 w-full" data-index={vItem.index}
                                     style={
                                         {
                                             transform: `translateY(${vItem.start}px)`,
                                             height: `${vItem.size}px`,
                                         }
                                     }>
                                    <ShortPostComponent postData={post}/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default PostsFlow;