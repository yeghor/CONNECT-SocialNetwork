import React, { useEffect, useState } from "react";

import { fetchFeedPosts, fetchFollowedPosts } from "../../fetching/fetchSocial.ts";

import {  
    getCookies,
    removeCookie,
    setUpdateCookie
} from "../../helpers/cookies/cookiesHandlert.ts";

import {
    FeedPostResponse
} from "../../fetching/responseDTOs.ts"

import { userShortProfilesMapper } from "../../fetching/responseDTOs.ts";



// Base Home page with posts
const socialPage = () => {
    const [ accessToken, refreshToken ] = getCookies()
    const [ posts, setPosts ] = useState<FeedPostResponse[]>([]);
    const [ feed, setFeed ] = useState(true);
    const [ page, setPage ] = useState(0);


    const fetcher = async () => {
        const fetchedPosts = await fetchFeedPosts(accessToken, page);

        if (fetchedPosts.success) {
            setPosts(() => posts.concat(fetchedPosts.data));
        }

    }
    
    useEffect(() => {
        fetcher();
    })

    const loadMore = () => {
        setPage(page + 1);
        fetcher();
    }

    return (
        <div>
            
        </div>
    )
}

export default socialPage;