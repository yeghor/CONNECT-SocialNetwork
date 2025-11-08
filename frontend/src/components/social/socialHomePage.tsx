import React, { useState } from "react";

import RecentActivityComponent from "./post/recentActivityComponent.tsx";
import PostsFlow from "./post/postsFlow.tsx";


const SocialHomePage = () => {
    // Add recent activities by followed users
    // Make post form
    // Trending hashtags ???
    return(
        <div>
            <div>
                <PostsFlow />
            </div>
            <div>
                <RecentActivityComponent />
            </div>
        </div>
    )
};

export default SocialHomePage;