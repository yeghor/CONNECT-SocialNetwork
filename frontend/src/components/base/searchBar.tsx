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

    };

    return (
        <div className="w-full">
            <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setPrompt(e.target.value)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 transition-all text-white"
            />
        </div>

    )
}

export default SearchBar;