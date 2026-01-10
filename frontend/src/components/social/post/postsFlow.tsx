import React, { useEffect, useRef, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import { safeAPICall } from "../../../fetching/fetchUtils.ts";

import {
    getCookiesOrRedirect,
    CookieTokenObject
} from "../../../helpers/cookies/cookiesHandler.ts";

import { FeedPost, FeedPostsResponse } from "../../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import { NavigateFunction } from "react-router-dom";
import FlowPost from "./flowPost.tsx";
import { fetchFeedPosts, fetchFollowedPosts } from "../../../fetching/fetchSocial.ts";
import estimatePostSize from "../../../helpers/postSizeEstimator.ts";

import VirtualizedList from "../../butterySmoothScroll/virtualizedList.tsx";
import { createInfiniteQueryOptionsUtil, infiniteQieryingFetchGuard } from "../../butterySmoothScroll/scrollVirtualizationUtils.ts";

interface PostsFlowFetcherInterface {
    // Depends on image existence
    estimatedSize: number;
    postId: string;
    postData: FeedPost;
}

type PostsFlowComponents = PostsFlowFetcherInterface[];

const createPostFlowResponse = (data: FeedPost[]): PostsFlowComponents => {
    return data.map((post) => {
        let estimatedSize: number = estimatePostSize(post.picturesURLs.length, post.isReply);

        return {
            estimatedSize: estimatedSize,
            postId: post.postId,
            postData: post
        };
    })
}

const postFetcher = async (tokens: CookieTokenObject, feed: boolean, navigate: NavigateFunction, page: number): Promise<PostsFlowComponents> => {
    const fetchFunction = feed ? fetchFeedPosts : fetchFollowedPosts;

    const fetchedPosts = await safeAPICall<FeedPostsResponse>(tokens, fetchFunction, navigate, undefined, page)

    if (fetchedPosts.success) {
        return createPostFlowResponse(fetchedPosts.data);
    }

    return [];

}

const PostsFlow = () => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);
    const [ feed, setFeed ] = useState(true);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(postFetcher, [tokens, feed, navigate], ["posts", feed]));
    const [ posts, setPosts ] = useState<PostsFlowComponents>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: posts.length,
        estimateSize: (index) => {
            const post = posts[index];
            return post.estimatedSize;
        },
        measureElement: (element) => { return element?.getBoundingClientRect().height },
        getScrollElement: () => scrollRef.current,
    });

    const virtualItems = virtualizer.getVirtualItems();


    const infiniteQuerying = async () => {
        const flatMapPosts = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((post) => post !== undefined) ?? []
        setPosts(flatMapPosts)

        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, posts.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, feed]);

    const toggleFeed = () => {
        setFeed(!feed);
    }

    const virtualizedComponentsProps = posts.map((post) => { return { postData: post.postData, isMyPost: false} } )

    return (
        <div>
            <div>
                <div className="flex items-center justify-center">
                    <div className="flex justify-start">
                        <div className="flex justify-center gap-2 m-6 text-white">
                            <button
                                className={`px-4 py-2 rounded-3xl ${
                                    !feed ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                                }`}
                                onClick={() => {
                                    if(!feed) {
                                        toggleFeed();
                                    }
                                }}
                            >
                                For You
                            </button>
                            <button
                                className={`px-4 py-2 rounded-3xl ${
                                    feed ? "bg-white/10 hover:bg-white/20 hover:scale-105 transition-all" : "bg-white/30"
                                }`}
                                onClick={() => {
                                    if(feed) {
                                        toggleFeed();
                                    }
                                }}
                            >
                                Followed
                            </button>
                        </div>
                    </div>
                </div>
                <div ref={scrollRef} className="lg:h-[700px] md:h-[600px] sm:h-[400px] overflow-auto mb-16 relative mx-auto border-gray-300">
                    <VirtualizedList DisplayedComponent={FlowPost} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={virtualizedComponentsProps} />
                </div>
            </div>
        </div>
    );
}

export default PostsFlow;