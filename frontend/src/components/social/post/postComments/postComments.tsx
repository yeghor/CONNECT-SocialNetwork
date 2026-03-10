import React, { useEffect, useRef } from "react";
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
    console.log("startiong mapping")
    const flowData = data.map((post) => {
        console.log(post.picturesURLs)
        let estimatedSize: number = estimatePostSize(post.picturesURLs.length, post.isReply);
        console.log("computed estimatedSize")
        return {
            estimatedSize: estimatedSize,
            postId: post.postId,
            postData: post
        };
    });
    console.log(flowData)
    return flowData;
}

const commentsFetcher = async (tokens: CookieTokenObject, navigate: NavigateFunction, postId: string, page: number): Promise<PostsCommentsFlowPrepared> => {
    console.log(`Fetching comments for post ${postId}, page ${page}`);
    const fetchedPostsResponse = await safeAPICallPublic<PostCommentsResponse>(tokens, fetchPostComments, navigate, undefined, postId, page);
    console.log("bamabm ")
    if (fetchedPostsResponse.success === false) {
        console.log("return []");
        return [];
    }

    console.log("fetchedPostsResponse.data", fetchedPostsResponse.data)
    console.log("createPostFlowResponse(fetchedPostsResponse.data)", createPostFlowResponse(fetchedPostsResponse.data));
    console.log("data mapped")
    return createPostFlowResponse(fetchedPostsResponse.data);
}

export interface CommentProps {
    originalPostId: string
}

const PostComments = (props: CommentProps) => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(commentsFetcher, [tokens, navigate, props.originalPostId], ["postComments", props.originalPostId]));

    const posts: PostsCommentsFlowPrepared = data?.pages?.flatMap((page) => page ?? []) ?? [];

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

    const infiniteQuerying = async () => {
        const lastItem = virtualItems[virtualItems.length - 1]
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, posts.length)) await fetchNextPage();
    }

    useEffect(() => {
        infiniteQuerying();
    }, [virtualItems, hasNextPage, isFetchingNextPage, posts.length, props.originalPostId]);

    const virtualizedComponentsProps = posts.map((post) => { return { postData: post.postData, isMyPost: false} } )

    return(
        <div ref={scrollRef} className="h-[800px] overflow-auto mb-16 relative mx-auto border-gray-300">
            { virtualItems.length === 0 ? <p className="text-center text-white my-8">{"No comments yet :("}</p> : <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                <VirtualizedList DisplayedComponent={FlowPost} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={virtualizedComponentsProps} />
            </div>}
        </div>
    );
};

export default PostComments;
