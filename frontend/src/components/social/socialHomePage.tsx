import React, { useState } from "react";

import RecentActivityComponent from "./post/recentActivityComponent.tsx";
import PostsFlow from "./post/postsFlow.tsx";
import MakePost from "./post/makePost.tsx";
import { removeCookie } from "../../helpers/cookies/cookiesHandler.ts";
import { AccessTokenCookieKey, RefreshTokenCookieKey } from "../../consts.ts";

const SocialHomePage = () => {

    return(
        <div className="flex gap-8 m-16">
            <div className="w-1/3">
                <MakePost postType="post" parentPostId={null} />
            </div>
            <div className="w-1/3 mx-auto">
                <PostsFlow />
            </div>
            <div className="w-1/3">
                <RecentActivityComponent />
            </div>
            <button className="bg-red-500 text-white" onClick={() => { removeCookie(AccessTokenCookieKey); removeCookie(RefreshTokenCookieKey); } }>logout type button</button>
        </div>
    )
};

export default SocialHomePage;