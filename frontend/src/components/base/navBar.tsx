import React from "react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

import  { appHomeURI } from "../../consts.ts";

const NavigationBar = (): ReactNode => {
    return (
        <div>
            <nav>
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to={appHomeURI} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="/connect-logo-full.png" className="h-15 w-auto hover:scale-110 transition-all" alt="Connect Logo" />
                    </Link>
                        <ul className="flex flex-col p-4 md:p-0 mt-4 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
                            <li>
                                <Link to="/" className="block py-2 px-3" aria-current="page">
                                    <img src="/feed-title.png" alt="Feed" className="h-10 w-auto hover:scale-110 transition-all"></img>
                                </Link>
                            </li>
                            <li>
                                <Link to="/chat" className="block py-2 px-3" aria-current="page">
                                    <img src="/chat-title.png" alt="Chat" className="h-10 w-auto hover:scale-110 transition-all"></img>
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-profile" className="block py-2 px-3" aria-current="page">
                                    <img src="/me-title.png" alt="Me" className="h-10 w-auto hover:scale-110 transition-all"></img>
                                </Link>
                            </li>
                        </ul>
                </div>
            </nav>

        </div>
    );
}

export default NavigationBar