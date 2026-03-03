import React, { useState, useEffect, useRef } from "react";
import { createInfiniteQueryOptionsUtil } from "../../../butterySmoothScroll/scrollVirtualizationUtils.ts";
import { useNavigate, NavigateFunction } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

import { PostCommentsResponse, ShortPost } from "../../../../fetching/DTOs.ts";
import { getCookieTokens } from "../../../../helpers/cookies/cookiesHandler.ts";
import { fetchPostComments } from "../../../../fetching/fetchSocial.ts";
import { safeAPICallPublic } from "../../../../fetching/fetchUtils.ts";
import VirtualizedList from "../../../butterySmoothScroll/virtualizedList.tsx";
import { infiniteQieryingFetchGuard } from "../../../butterySmoothScroll/scrollVirtualizationUtils.ts";
import estimatePostSize from "../../../../helpers/postSizeEstimator.ts";
import { CookieTokenObject } from "../../../../helpers/cookies/cookiesHandler.ts";
import { loginURI } from "../../../../consts.ts";
import FlowPost from "../flowPost.tsx";

interface PostsCommentsFlow {
    // Depends on image existence
    estimatedSize: number;
    postId: string;
    postData: ShortPost;
}

type PostsCommentsFlowPrepared = PostsCommentsFlow[];

const createPostFlowResponse = (data: ShortPost[]): PostsCommentsFlowPrepared => {
    return data.map((post) => {
        let estimatedSize: number = estimatePostSize(post.picturesURLs.length, post.isReply);

        return {
            estimatedSize: estimatedSize,
            postId: post.postId,
            postData: post
        };
    })
}

const commentsFetcher = async (tokens: CookieTokenObject, navigate: NavigateFunction, postId: string, page: number): Promise<PostsCommentsFlowPrepared> => {
    console.log(`Fetching comments for post ${postId}, page ${page}`); // Проверьте, что page не undefined
    const fetchedPostsResponse = await safeAPICallPublic<PostCommentsResponse>(tokens, fetchPostComments, navigate, undefined, postId, page);

    console.log("Response:", fetchedPostsResponse);

    if (fetchedPostsResponse.success === false) {
        console.log("returninng empty list")
        return [];
    }

    console.log(fetchedPostsResponse.data);
    return createPostFlowResponse(fetchedPostsResponse.data);
}

export interface CommentProps {
    originalPostId: string
}

const PostComments = (props: CommentProps) => {
    console.log("rendering post comments")
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(commentsFetcher, [tokens, navigate, props.originalPostId], ["postComments", props.originalPostId]));
    const [ posts, setPosts ] = useState<PostsCommentsFlowPrepared>(data?.pages ?? []);

    const virtualizer = useVirtualizer({
        count: posts.length,
        estimateSize: (index) => {
            const post = posts[index];
            return post.estimatedSize;
        },
        measureElement: (element) => { return element?.getBoundingClientRect().height },
        overscan: 1,
        getScrollElement: () => scrollRef.current,
    });

    const virtualItems = virtualizer.getVirtualItems();

    const flatMapPosts = data?.pages.flatMap((page) => {if(page) { return page; }}).filter((post) => post !== undefined) ?? []

    const infiniteQuerying = async () => {
        setPosts(flatMapPosts)
        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, posts.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, props.originalPostId]);

    const virtualizedComponentsProps = posts.map((post) => { return { postData: post.postData, isMyPost: false} } )
    console.log(virtualItems.length)

    return(
        <div ref={scrollRef} className="h-600px overflow-auto mb-16 relative mx-auto border-gray-300">
            { virtualItems.length !== 0 ? <p className="text-center text-white my-8">{"No comments yet :("}</p> : <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                <VirtualizedList DisplayedComponent={FlowPost} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={virtualizedComponentsProps} />
            </div>}
        </div>
    );
};

export default PostComments;
