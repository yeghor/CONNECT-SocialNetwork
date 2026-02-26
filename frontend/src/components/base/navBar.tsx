import React, { useEffect, useState, useRef, RefObject } from "react";
import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import  { AccessTokenCookieKey, homeURI, loginURI, myProfileURI, RefreshTokenCookieKey, registerURI } from "../../consts.ts";
import SearchBar from "./searchBar.tsx";
import { getCookieTokens, removeCookie } from "../../helpers/cookies/cookiesHandler.ts";
import { fetchLogout } from "../../fetching/fetchAuth";
import { safeAPICallNoToken, safeAPICallPrivate } from "../../fetching/fetchUtils";
import { SuccessfulResponse } from "../../fetching/DTOs";

const NavigationBar = (): ReactNode => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);

    const [ showLogoutConfirmModal, setShowLogoutConfirmModal ] = useState(false);
        
    const handleLogout = () => {
        if (tokens.access && tokens.refresh) {
            setShowLogoutConfirmModal(false);
            removeCookie(AccessTokenCookieKey);
            removeCookie(RefreshTokenCookieKey);
            navigate(loginURI);
            safeAPICallNoToken<SuccessfulResponse>(fetchLogout, navigate, undefined, tokens.access, tokens.refresh);
        }
    };


    return (
        <div>
            { showLogoutConfirmModal ? <LogoutModal setShowLogoutConfirmModal={setShowLogoutConfirmModal} handleLogout={handleLogout} /> : null}
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
                        <li>
                            {tokens.refresh ?
                                <button onClick={() => setShowLogoutConfirmModal(true)} className="py-2 px-3">
                                    <img src="/logout-title.png" alt="Me" className="h-10 w-auto hover:scale-110 transition-all" />
                                </button>
                                :
                                <Link to={registerURI}>
                                    <img src="/sign-in-title.png" alt="Sign in" className="h-10 w-auto hover:scale-110 transition-all" />
                                </Link>
                            }
                        </li>
                    </ul>

                </div>
            </nav>
        </div>
    );
}

const LogoutModal = (props: {
    setShowLogoutConfirmModal: React.Dispatch<React.SetStateAction<boolean>>
    handleLogout: () => void
}) => {

    const logoutConfirmModalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (logoutConfirmModalRef.current && !logoutConfirmModalRef.current.contains(e.target as Node)) {
                props.setShowLogoutConfirmModal(false);
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                <div ref={logoutConfirmModalRef} className="bg-white/10 w-full text-white max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-semibold text-white/90">Are you sure you want to logout?</h2>
                        <button 
                            onClick={() => props.setShowLogoutConfirmModal(false)} 
                            className="text-white/50 hover:text-white transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="px-6 py-4 flex justify-between gap-3 bg-white/5 border-t border-white/10">
                        <button 
                            onClick={() => props.setShowLogoutConfirmModal(false)} 
                            className="grow px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors rounded-xl"
                        >
                            No
                        </button>
                        <button 
                            onClick={props.handleLogout} 
                            className="grow px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors rounded-xl"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default NavigationBar;