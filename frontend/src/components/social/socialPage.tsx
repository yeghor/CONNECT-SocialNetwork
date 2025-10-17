import React, {useEffect, useRef, useState} from "react";
import { queryClient } from "../../index.tsx";

import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import PostComponent from "./post/post.tsx";

import { fetchFeedPosts, fetchFollowedPosts } from "../../fetching/fetchSocial.ts";


import {
    getCookiesOrRedirect,
    CookieTokenObject
} from "../../helpers/cookies/cookiesHandler.ts";


import {FeedPostResponse, FeedPostsResponse} from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import {retryUnauthorizedResponse, validateResponse} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import {NavigateFunction} from "react-router-dom";
import {internalServerErrorURI, unauthorizedRedirectURI} from "../../consts.ts";
import {APIResponseResolved} from "../../fetching/fetchUtils.ts";

// TODO: Add 401 retry
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
const SocialPage = () => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);
    const [ feed, setFeed ] = useState(true);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createPostsInfiniteQueryOptions(tokens, feed, navigate));
    const [ posts, setPosts ] = useState<FeedPostResponse[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: posts?.length ?? 0,
        estimateSize: () => 200,
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
        <div>
            <div onClick={toggleFeed}>Toogle feed</div>
            <div ref={scrollRef} className="h-[80vh] overflow-auto relative">
                <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                    {
                        virtualItems.map((vItem) => {
                            const post = posts[vItem.index];
                            return (
                                <div key={vItem.key} className="absolute top-0 left-0 w-full" data-index={vItem.index}
                                     style={
                                         {
                                             transform: `translateY(${vItem.start}px)`,
                                             height: `${vItem.size}px`
                                         }
                                     }>
                                    <PostComponent postData={post}/>
                                    <p className="text-white">{vItem.index}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default SocialPage;