import React from "react";

const LoadingIndicator = (props: { customMessage: string | undefined }) => {
    return (
        <div className="text-white text-xl flex justify-center items-center font-bold h-full w-full animate-pulse">
            { props.customMessage ? props.customMessage : "Loading..." }
        </div>
    );
};

export default LoadingIndicator