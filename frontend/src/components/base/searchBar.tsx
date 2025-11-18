import React, { useState } from "react";
import { useNavigate } from "react-router";

const SearchBar = () => {
    const [ prompt, setPrompt ] = useState("");

    const search = () => {

    };

    return (
        <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/10 transition-all text-white"
        />
    )
}

export default SearchBar;