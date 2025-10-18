import React, {} from "react"

import { OwnerResponse } from "../../../fetching/responseDTOs.ts"

interface ownerProps {
    ownerData: OwnerResponse
}

const OwnerComponent = (props: ownerProps) => {
    return (
        <div className="inline text-white">
            {props.ownerData.username}
        </div>
    )
};

export default OwnerComponent;