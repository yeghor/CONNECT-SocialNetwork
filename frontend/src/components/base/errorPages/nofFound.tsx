import React from "react";
import { homeURI } from "../../../consts";
import { Link } from "react-router";


const NotFoundPage = () => {
    return(
        <div className="h-screen">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center text-white">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-7xl text-primary-600 dark:text-primary-500">404</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold md:text-4xl">Either the link is broken, or the page escaped our servers.</p>
                    <Link to={homeURI} className="inline-flex text-white bg-primary-600 bg-white/10 border-2 border-white/10 hover:bg-primary-800 focus:ring-4 hover:scale-105 transition-all font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Let's get you back on track</Link>
                </div>   
            </div>
        </div>
    );
};

export default NotFoundPage;