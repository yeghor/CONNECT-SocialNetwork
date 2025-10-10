import React, { useEffect, useState } from "react";

import PostComponent from "./post/post.tsx";
import LoginForm from "../auth/loginForm.tsx";

import { fetchFeedPosts, fetchFollowedPosts } from "../../fetching/fetchSocial.ts";

import {  
    getCookiesOrRedirect,
    removeCookie,
    setUpdateCookie
} from "../../helpers/cookies/cookiesHandler.ts";

import {
    FeedPostResponse
} from "../../fetching/responseDTOs.ts"

import { userShortProfilesMapper } from "../../fetching/responseDTOs.ts";
import { redirect } from "react-router";



// Base Home page with posts
const SocialPage = () => {
    const tokens = getCookiesOrRedirect(redirect)
    const [ posts, setPosts ] = useState<FeedPostResponse[]>([]);
    const [ feed, setFeed ] = useState(true);
    const [ page, setPage ] = useState(0);


    const postFetcher = async () => {
        if(tokens.access) {
            const fetchedPosts = await fetchFeedPosts(tokens.access, page);
            if (fetchedPosts.success) {
                setPosts(() => posts.concat(fetchedPosts.data));
            }
        }

    }
    
    useEffect(() => {
        postFetcher();
    })

    const loadMore = () => {
        setPage(page + 1);
        postFetcher();
    }

    return (
        <div>
            <LoginForm />
        </div>
    )
}

export default SocialPage;