import React, { useRef, useState } from "react";

import {infiniteQueryOptions, useInfiniteQuery} from "@tanstack/react-query";
import {useVirtualizer} from "@tanstack/react-virtual";

import PostComponent from "./post/post.tsx";

import { fetchFeedPosts, fetchFollowedPosts } from "../../fetching/fetchSocial.ts";


import {  
    getCookiesOrRedirect,
    CookieTokenObject
} from "../../helpers/cookies/cookiesHandler.ts";


import { userShortProfilesMapper } from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import {retryUnauthorizedResponse, validateResponse} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import {NavigateFunction} from "react-router-dom";
import {internalServerErrorURI, unauthorizedRedirectURI} from "../../consts.ts";
import { APIResponse } from "../../fetching/fetchUtils.ts";
import post from "./post/post.tsx";

const postFetcher = async (tokens: CookieTokenObject, page: number, feed: boolean, navigate: NavigateFunction) => {
    if(tokens.access) {
        console.log("Fetching post...");
        console.log(tokens.access);

        const fetchedPosts = await fetchFeedPosts(tokens.access, page);

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
        queryKey: ["posts"],
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

    const { data } = useInfiniteQuery(createPostsInfiniteQueryOptions(tokens, feed, navigate));
    const posts = data?.pages.flatMap((page) => {if(page && page.success) { return page.data; }})

    if(!posts) {
        navigate(internalServerErrorURI);
    }


    console.log(posts);

    const virtualizer = useVirtualizer({
        count: posts?.length ?? 0,
        estimateSize: () => 200,
        getScrollElement: () => scrollRef.current
    });


    const scrollRef = useRef<HTMLDivElement>(null);

    if (posts && virtualizer) {
        return (
            <div ref={scrollRef} className="h-[80vh] overflow-auto relative">
                <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                    {
                        virtualizer.getVirtualItems().map((vItem) => {
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
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default SocialPage;