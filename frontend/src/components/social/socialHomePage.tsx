import React, { useState } from "react";

import RecentActivityComponent from "./post/recentActivityComponent.tsx";
import PostsFlow from "./post/postsFlow.tsx";
import MakePost from "./post/makePost.tsx";

const SocialHomePage = () => {
    // Add recent activities by followed users
    // Make post form
    // Trending hashtags ???
    return(
        <div className="flex gap-8 m-16">
            <div className="w-1/3">
                <MakePost />
            </div>
            <div className="w-1/3 mx-auto">
                <PostsFlow />
            </div>
            <div className="w-1/3">
                <RecentActivityComponent />
            </div>
        </div>
    )
};

export default SocialHomePage;