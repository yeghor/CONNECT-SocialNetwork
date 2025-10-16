import React, {useEffect, useRef, useState} from "react";

import { List } from "react-window";

import PostComponent from "./post/post.tsx";

import {fetchFeedPosts, fetchFollowedPosts} from "../../fetching/fetchSocial.ts";

import {  
    getCookiesOrRedirect,
} from "../../helpers/cookies/cookiesHandler.ts";

import {
    FeedPostResponse
} from "../../fetching/responseDTOs.ts"

import { userShortProfilesMapper } from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import {retryUnauthorizedResponse, validateResponse} from "../../helpers/responseHandlers/getResponseHandlers.ts";
import {useVirtualizer} from "@tanstack/react-virtual";

// Base Home page with posts
const SocialPage = () => {
    const navigate = useNavigate();

    const tokens = getCookiesOrRedirect(navigate)
    const [ posts, setPosts ] = useState<FeedPostResponse[]>([]);
    const [ feed, setFeed ] = useState(true);
    const [ page, setPage ] = useState(0);

    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: posts.length,
        estimateSize: () => 200,
        getScrollElement: () => scrollRef.current
    });


    useEffect(() => {
        const postFetcher = async () => {
            if(tokens.access) {
                console.log("Fetching post...");
                console.log(tokens.access);

                let fetchedPosts: any

                if(feed) {
                    fetchedPosts = await fetchFeedPosts(tokens.access, page);
                } else {
                    fetchedPosts = await fetchFollowedPosts(tokens.access, page);
                }


                if(!validateResponse(fetchedPosts)) {
                    return;
                }

                if (fetchedPosts.success) {
                    setPosts((prevPosts) => prevPosts.concat(fetchedPosts.data));
                }
            }
        }

        postFetcher();
    }, [page, feed])

    const loadMore = () => {
        setPage(page + 1);
    }

    return (
        <div ref={scrollRef}>
            <div className="relative" style={{height: `${virtualizer.getTotalSize()}px`}}>
                {
                    virtualizer.getVirtualItems().map((vItem) => {
                        const post = posts[vItem.index];
                        return (
                            <div key={vItem.key} className="absolute top-0 left-0 w-full" data-index={vItem.index} style={
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

export default SocialPage;