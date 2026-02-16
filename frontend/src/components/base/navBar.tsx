import React from "react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

import  { homeURI, myProfileURI } from "../../consts.ts";
import SearchBar from "./searchBar.tsx";

const NavigationBar = (): ReactNode => {
    return (
        <nav className="w-full">
            <div className="flex items-center justify-between w-full p-4">
                <div className="flex items-center w-1/3">
                    <Link to={homeURI} className="flex items-center">
                        <img
                            src="/connect-logo-full.png"
                            className="h-15 w-auto hover:scale-110 transition-all"
                            alt="Connect Logo"
                        />
                    </Link>
                </div>
            
                <div className="flex justify-center w-1/3">
                    <div className="w-full max-w-md">
                        <SearchBar />
                    </div>
                </div>

                <ul className="flex items-center justify-end w-1/3 space-x-4">
                    <li>
                        <Link to="/" className="py-2 px-3" aria-current="page">
                            <img src="/feed-title.png" alt="Feed" className="h-10 w-auto hover:scale-110 transition-all" />
                        </Link>
                    </li>
                    <li>
                        <Link to="/chats" className="py-2 px-3">
                            <img src="/chat-title.png" alt="Chat" className="h-10 w-auto hover:scale-110 transition-all" />
                        </Link>
                    </li>
                    <li>
                        <Link to={myProfileURI} className="py-2 px-3">
                            <img src="/me-title.png" alt="Me" className="h-10 w-auto hover:scale-110 transition-all" />
                        </Link>
                    </li>
                </ul>

            </div>
        </nav>
    );
}

export default NavigationBar