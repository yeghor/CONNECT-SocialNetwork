import React, { useState } from "react";


const MakePost = () => {
    const CreatePost = () => {
        
    };
    
    return(
        <div className="w-full mx-auto p-4 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12 text-white">
            <div className="mb-6 space-y-3">
                <div className="text-xl font-semibold">Make a Post</div>

                <input
                    type="text"
                    placeholder="Title..."
                    className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                />

                <textarea
                    placeholder="Text..."
                    className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                ></textarea>

                <div className="flex items-center justify-between">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:hover:bg-white/20 file:cursor-pointer"
                    />
                    <p className="text-sm text-white/50">Up to 3 images</p>
                </div>

                <button
                    className="w-full py-2 mt-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition border border-white/20"
                    onClick={() => CreatePost()}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default MakePost;

