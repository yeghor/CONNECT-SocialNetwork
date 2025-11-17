import React, {FunctionComponent, ReactElement, ReactNode, useEffect, useRef, useState} from "react";
import { queryClient } from "../../../index.tsx";

import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import { fetchFeedPosts, fetchFollowedPosts } from "../../../fetching/fetchSocial.ts";


import {
    getCookiesOrRedirect,
    CookieTokenObject
} from "../../../helpers/cookies/cookiesHandler.ts";


import {FeedPostResponse, FeedPostsResponse} from "../../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import {validateGETResponse} from "../../../helpers/responseHandlers/getResponseHandlers.ts";
import { checkUnauthorizedResponse, retryUnauthorizedResponse } from "../../../fetching/fetchUtils.ts";
import {NavigateFunction} from "react-router-dom";
import {internalServerErrorURI, unauthorizedRedirectURI} from "../../../consts.ts";
import {APIResponseResolved} from "../../../fetching/fetchUtils.ts";
import FlowPost from "./flowPost.tsx";


interface PostsFlowFetcherInterface {
    component: React.JSX.Element;
    // Depends on image existence
    estimatedSize: number;
    postId: string
}

type PostsFlowComponents = PostsFlowFetcherInterface[];

const createPostFlowResponse = (data: FeedPostResponse[]): PostsFlowComponents => {
    return data.map((post) => {
        let componentSize: number = 200;

        switch (true) {
            case (post.picturesURLs.length <= 0):
                componentSize = 250;
                break;
            case (post.picturesURLs.length === 1):
                componentSize = 350;
                break;
            case (post.picturesURLs.length >= 2):
                componentSize = 500;
        }

        if (post.isReply) {
            componentSize += 100
        }

        const component = (
            <FlowPost postData={post}/>
        );

        return {
            component: component,
            estimatedSize: componentSize,
            postId: post.postId,
        };
    })
}

const postFetcher = async (tokens: CookieTokenObject, page: number, feed: boolean, navigate: NavigateFunction): Promise<PostsFlowComponents | undefined> => {
    if(tokens.access) {
        console.log(tokens.access);

        let fetchedPosts: APIResponseResolved<FeedPostsResponse>;

        if (feed) {
            fetchedPosts = await fetchFeedPosts(tokens.access, page);
        } else {
            fetchedPosts = await fetchFollowedPosts(tokens.access, page);
        }

        if(!validateGETResponse(fetchedPosts)) {
            navigate(internalServerErrorURI);
            return undefined;
        }

        if(tokens.refresh && tokens.refresh && checkUnauthorizedResponse(fetchedPosts)) {
            const fetchFunc = feed ? fetchFeedPosts : fetchFollowedPosts;
            const retried = await retryUnauthorizedResponse<FeedPostsResponse>(fetchFunc, tokens.refresh, navigate, undefined, page);
            if(retried && retried.success) {
                return createPostFlowResponse(retried.data);
            } else { return undefined; }
        }
        if(fetchedPosts.success) {
            return createPostFlowResponse(fetchedPosts.data);
        }

        return undefined;
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
            if (lastPage) {
                if (!lastPage || lastPage.length === 0) {
                    return undefined;
                }
                return lastPageParam + 1;
            } else {
                return undefined;
            }
        },
        refetchOnWindowFocus: false,
    });
}

// Base Home page with posts
const PostsFlow = () => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate);
    const [ feed, setFeed ] = useState(true);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createPostsInfiniteQueryOptions(tokens, feed, navigate));
    const [ posts, setPosts ] = useState<PostsFlowComponents>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: posts?.length ?? 0,
        estimateSize: (index) => {
            const post = posts[index];
            return post.estimatedSize;
        },
        measureElement: (element) => { console.log(element?.getBoundingClientRect().height); return element?.getBoundingClientRect().height },
        overscan: 16,
        getScrollElement: () => scrollRef.current,
    });
    const virtualItems = virtualizer.getVirtualItems();


    const infiniteQuerying = async () => {
        const flatMapPosts = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((post) => post !== undefined) ?? []
        setPosts(flatMapPosts)

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
            <div>
                <div className="">
                    <div className="flex justify-start">
                        <div className="flex justify-center gap-2 mb-4 text-white">
                            <button
                                className={`px-4 py-2 rounded-3xl ${
                                    !feed ? "bg-white/10 hover:bg-white/30 transition-all" : "bg-white/30"
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
                                    feed ? "bg-white/10 hover:bg-white/30 transition-all" : "bg-white/30"
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
                <div ref={scrollRef} className="h-[80vh] overflow-auto relative mx-auto border-gray-300">
                    <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                        {
                            virtualItems.map((vItem) => {
                                const postData = posts[vItem.index];
                                return (
                                    <div key={postData.postId + vItem.index} className="absolute top-0 left-0 w-full" data-index={vItem.index}
                                         style={
                                             {
                                                 transform: `translateY(${vItem.start}px)`,
                                                 height: `${vItem.size}px`,
                                             }
                                         }>
                                        <div className="hover:-translate-y-0.5 hover:border-white hover:border-3 transition-all">
                                            {postData.component}
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostsFlow;