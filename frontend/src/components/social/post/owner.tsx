import React, {} from "react"

import { User } from "../../../fetching/DTOs.ts";
import { tz } from "../../../consts.ts";

interface ownerProps {
    ownerData: User | null
    postPublished: Date;
    avatarHeight: number;
}

/* Includes published field for post and owner data */
const PostOwnerComponent = (props: ownerProps) => {
    return (
        <div>
            <div className="flex items-center gap-2">
                <img src={props.ownerData?.avatarURL ?? "/uknown-user-image.jpg"} alt="avatar" className={`h-8 w-8 rounded-full`}/>
                <div className="font-semibold text-white">{props.ownerData?.username ?? "Deleted User"}</div>
            </div>
            <div className="text-white flex gap-2 items-center">
                <div className="text-xs text-gray-200 pt-4">
                    {props.postPublished.toLocaleString(undefined, {"timeZone": tz})}
                </div>
            </div>
        </div>
    )
};

export default PostOwnerComponent;