import React from "react";

const WarningMessage = (props: { message: string }) => {
    return (
        <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-lg animate-pulse">
            {props.message}
        </div>
    );
};

export default WarningMessage;