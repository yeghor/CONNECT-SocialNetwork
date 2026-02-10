import React, {} from "react"

import { User } from "../../../fetching/DTOs.ts"

interface ownerProps {
    ownerData: User
    postPublished: Date;
    avatarHeight: number;
}

const OwnerComponent = (props: ownerProps) => {
    return (
        <div>
            <div className="flex items-center gap-2">
                {props.ownerData.avatarURL ?
                    <img src={props.ownerData.avatarURL} alt="avatar" className={`h-${props.avatarHeight} rounded-full`}/>
                    :
                    <img src="/uknown-user-image.jpg" alt="avatar" className={`h-${props.avatarHeight} rounded-full`} />
                }
                <div className="font-semibold text-white">{props.ownerData.username}</div>
            </div>
            <div className="text-white flex gap-2 items-center">
                <div className="text-xs text-gray-200 pt-4">
                    <span>{props.postPublished.toISOString().split("T")[0]}</span>
                    <span className="mx-2">{`${props.postPublished.getHours()}:${props.postPublished.getMinutes()}`}</span>
                </div>
            </div>
        </div>
    )
};

export default OwnerComponent;