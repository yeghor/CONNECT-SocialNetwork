import React, { useState } from "react";

import RecentActivityComponent from "./post/recentActivityComponent.tsx";
import PostsFlow from "./post/postsFlow.tsx";


const SocialHomePage = () => {
    // Add recent activities by followed users
    // Make post form
    // Trending hashtags ???
    return(
        <div className="columns-3 justify-center gap-8 px-4 py-8">
            <div>
                <div className="sm:w-[900px] mx-auto w-1/3 p-4 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12 text-white">
                    <div className="mb-6 space-y-3">
                        <div className="text-xl font-semibold">Create a comment</div>

                        <input
                            type="text"
                            placeholder="Title..."
                            className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                        />

                        <textarea
                            placeholder="Write your comment..."
                            className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                        ></textarea>

                        <div className="flex items-center justify-between">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:hover:bg-white/20 file:cursor-pointer"
                            />
                            <span className="text-sm text-white/50">Up to 3 images</span>
                        </div>

                        <button
                            className="w-full py-2 mt-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition border border-white/20"
                        >
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>
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