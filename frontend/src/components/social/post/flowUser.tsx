import React from "react";
import {ShortUserProfile} from "../../../fetching/DTOs.ts";
import {Link} from "react-router-dom";
import {specificPostURI, specificUserProfileURI} from "../../../consts.ts";
import OwnerComponent from "./owner.tsx";

interface UserProps {
    userData: ShortUserProfile;
}

const FlowUser = ({ userData }: UserProps) => {
    return (
        <Link 
            to={specificUserProfileURI(userData.userId)} 
            className="w-full  group flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all m-2"
        >
            <div className="flex-none w-12">
                <img 
                    src={userData.avatarURL || "/uknown-user-image.jpg"} 
                    alt="avatar" 
                    className="h-10 w-auto rounded-full object-cover border border-white/20 group-hover:scale-110 transition-transform"
                />
            </div>

            <div className="flex-1 text-center">
                <span className="text-white font-medium truncate transition-colors">
                    {userData.username}
                </span>
            </div>                

            <div className="flex-none w-24 text-center">
                <span className="text-xs text-white/40 break-normal">
                    Joined: {userData.joined.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year:"numeric" })}
                </span>
            </div>
        </Link>
    );
};

export default FlowUser;