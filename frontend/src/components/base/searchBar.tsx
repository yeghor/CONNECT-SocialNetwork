import React, { useState } from "react";
import { useNavigate } from "react-router";
import { fetchSearchPosts, fetchSearchUsers } from "../../fetching/fetchSocial"
import { safeAPICall } from "../../fetching/fetchUtils"
import { FeedPostsResponse } from "../../fetching/responseDTOs"
import SearchPage from "../social/searchPage.tsx";

const SearchBar = () => {
    const navigate = useNavigate();

    const [ prompt, setPrompt ] = useState("");

    const search = () => {
        console.log("Search activated");
    };

    return (
        <div className="w-full flex justify-between">
            <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 transition-all text-white"
            />
            <button onClick={() => search()}>
                <img  src="/search-icon.png" alt="search-icon" className="h-8 pl-2 hover:scale-110 transition-all"/>
            </button>
        </div>

    );
};

export default SearchBar;