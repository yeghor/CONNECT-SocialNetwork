import React, {} from "react"
import { Link } from "react-router";

import { User } from "../../../fetching/DTOs.ts";
import { notFoundURI, specificUserProfileURI, tz } from "../../../consts.ts";
import { displayDayWithTZ as displayDayWithTZLocales } from "../../../helpers/dateUtils.ts";

interface ownerProps {
    ownerData: User | null
    postPublished: Date;
    avatarHeight: number;
}

/* Includes published post field for post and owner data */
const PostOwnerComponent = (props: ownerProps) => {
    return (
        <div>
            <Link to={specificUserProfileURI(props.ownerData?.userId ?? notFoundURI)}>
                <div className="flex items-center gap-2">
                    <img src={props.ownerData?.avatarURL ?? "/uknown-user-image.jpg"} alt="avatar" className={`h-8 w-8 rounded-full`}/>
                    <div className="font-semibold text-white">{props.ownerData?.username ?? "Deleted User"}</div>
                </div>            
            </Link>

            <div className="text-white flex gap-2 items-center">
                <div className="text-xs text-gray-200 pt-4">
                    {displayDayWithTZLocales(props.postPublished)}
                </div>
            </div>
        </div>
    )
};

export default PostOwnerComponent;