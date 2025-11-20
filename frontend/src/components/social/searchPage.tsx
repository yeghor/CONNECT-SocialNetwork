import React from "react";

import { FeedPostResponse, ShortUserProfile } from "../../fetching/responseDTOs.ts";

// TODO: Implement inifinite querying as in PostsFlow component

interface searchPageProps {
    searchResult: FeedPostResponse[] | ShortUserProfile[];
    originalQuery: string;
}

const SearchPage = () => {
    // Initially, our current page must be set to 1. Because after navigating to the component the app made one search request at 0-page
    // Temp variable. Soon will be replaced with the tanstack infinite querying
    const page = 1;


    return(
        <div></div>
    );
};

export default SearchPage;
