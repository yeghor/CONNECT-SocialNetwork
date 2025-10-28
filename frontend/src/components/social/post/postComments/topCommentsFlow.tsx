import React, { useState, useEffect, useRef } from "react";

import PostComments from "./postComments.tsx";

import { FeedPostResponse, PostCommentsResponse, ShortPostInterface } from "../../../../fetching/responseDTOs.ts";
import { CookieTokenObject, getCookiesOrRedirect } from "../../../../helpers/cookies/cookiesHandler.ts"
import commentFetchHelper, { CommentProps } from "./commentFetchHelper.ts";
import { useNavigate } from "react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { NavigateFunction } from "react-router-dom";

const fetchWrapper = async (tokens: CookieTokenObject, postId: string, page: number, navigate: NavigateFunction): Promise<ShortPostInterface[] | undefined> => {
    const response = await commentFetchHelper(tokens, postId, page, navigate);
    if(response?.success) {
        return response.data;
    }
}

const createCommentsInfiniteQueryOptions = (tokens: CookieTokenObject, postId: string, navigate: NavigateFunction) => {
    return infiniteQueryOptions({
        queryKey: ["comments"],
        queryFn: ({pageParam}) => commentFetchHelper(tokens, postId, pageParam, navigate),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
            if (!lastPage || lastPage.data.length === 0) {
                return undefined;
            } else {
                return lastPageParam + 1;
            }
        },
    })
}


const CommentsFlow = (props: CommentProps) => {
    if(!props.originalPostData) {
        return null;
    }

    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createCommentsInfiniteQueryOptions(tokens, props.originalPostData.postId, navigate));
    const postComments = data?.pages.flatMap((page) => (page?.success && page?.data) ?? []) ?? [];

    const scrollRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: postComments?.length ?? 0,
        estimateSize: () => 200,
        getScrollElement: () => scrollRef.current,
        // Should re calculate virtual scroll elements positions when changing element
        measureElement: (element) => element.getBoundingClientRect().height
    });

    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if(!hasNextPage || isFetchingNextPage || !lastItem) return
        if(lastItem.index >= postComments?.length - 1) {
            fetchNextPage();
        }
    }, [virtualItems, hasNextPage, isFetchingNextPage]);

    return (
        <div ref={scrollRef} className="h-screen overflow-y-auto flex flex-col gap-4">
            <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                {
                    virtualItems.map((vItem) => {
                        // Add props passing
                        const commentData = postComments?.[vItem.index];
                        if(!commentData) { return null; }
                        return (
                            <div
                                key={vItem.key}
                                style={{
                                        transform: `translateY(${vItem.start}px)`,
                                        height: `${vItem.size}px`
                                    }}
                                className="absolute top-0 left-0 w-full"
                            >
                                <PostComments originalPostData={commentData} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default CommentsFlow;