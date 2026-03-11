import React from "react";
import { homeURI } from "../../../consts";
import { Link } from "react-router";


const Cooldown = () => {
    return(
        <div className="h-screen">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center text-white">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-7xl text-primary-600 dark:text-primary-500">Too many requests.</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl">For stability reasons, we temporarily limited your requests. Please wait a moment before continuing.</p>
                </div>   
            </div>
        </div>
    );
};

export default Cooldown;