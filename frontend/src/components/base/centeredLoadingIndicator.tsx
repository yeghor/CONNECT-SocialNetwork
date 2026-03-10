import React from "react";

const LoadingIndicator = (props: { customMessage: string | undefined, centerY: boolean }) => {
    return (
        <div className={`text-white p-8 text-xl flex justify-center ${props.centerY ? "items-center" :"items-start"} font-bold h-full w-full animate-pulse`}>
            { props.customMessage ? props.customMessage : "Loading..." }
        </div>
    );
};

export default LoadingIndicator