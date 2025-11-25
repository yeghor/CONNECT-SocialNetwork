import React from "react";
import {ShortUserProfile} from "../../../fetching/responseDTOs.ts";
import {Link} from "react-router-dom";
import {specificPostURI} from "../../../consts.ts";
import OwnerComponent from "./owner.tsx";

interface UserProps {
    userData: ShortUserProfile;
}

const FlowUser = (props: UserProps) => {
    console.log("got user");
    return(
        <div className="bg-white/10 border-white/30 rounded-lg p-4 shadow-sm overflow-hidden flex flex-col hover:scale-105 transition-all m-6">
            {props.userData.avatarURL ?
                <img src={props.userData.avatarURL} alt="avatar" className={`h-16 rounded-full`}/>
                :
                <img src="/uknown-user-image.jpg" alt="avatar" className={`h-16 w-16 rounded-full`} />
            }
        </div>
    );
};

export default FlowUser;