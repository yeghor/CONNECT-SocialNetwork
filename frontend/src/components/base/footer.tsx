import React, { ReactNode } from "react";
import { Link } from "react-router";
import { myProfileURL } from "../../fetching/urls";
import { chatsURI, homeURI, myProfileURI } from "../../consts";

const Footer = (): ReactNode => {
    return (
        <footer className="w-full bg-white/5 backdrop-blur-xl border-t border-white/10 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* Brand & Mission */}
                    <div className="space-y-4 md:col-span-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                            CONNECT
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed">
                            A place where ideas resonate. Share, communicate, and create content in a new format.
                        </p>

                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Platform</h3>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><Link to={homeURI} className="hover:text-white transition-colors">Feed</Link></li>
                            <li><Link to={myProfileURI} className="hover:text-white transition-colors">Your profile</Link></li>
                            <li><Link to={chatsURI} className="hover:text-white transition-colors">Chat</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="my-8 border-white/10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-white/40 uppercase tracking-[0.1em]">
                    <p>© {new Date().getFullYear()} CONNECT. Made with love for community.</p>
                    <div className="flex gap-6">
                        <a href="https://github.com/yeghor/CONNECT-SocialNetwork.git" className="hover:text-white transition-colors flex items-center gap-1">
                            GitHub <span className="text-[8px] opacity-50">↗</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;