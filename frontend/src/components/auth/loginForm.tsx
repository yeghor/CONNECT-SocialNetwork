import React, { useEffect, useState } from "react";
import { redirect } from "react-router";

import {
    appHomeURI,
    UsernameMinLength, UsernameMaxLength,
    PasswordMinLength, PasswordMaxLength,
    AccessTokenCookieKey, RefreshTokenCookieKey
} from "../../consts.ts"

import { fetchLogin } from "../../fetching/fetchAuth.ts"
import { validateResponse } from "../../helpers/responseHandlers/getResponseErrorHandler.ts"

import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler.ts"

const LoginForm = () => {
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");

    const formHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        const response = await fetchLogin(username, password);

        if(!validateResponse(response, setErrorMessage, redirect)) {
            return;
        }
        
        if(response.success) {
            setUpdateCookie(AccessTokenCookieKey, response.accessToken);
            setUpdateCookie(RefreshTokenCookieKey, response.refreshToken);
            redirect(appHomeURI);
            return;
        }
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                            {errorMessage && (
                                <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700 transition-all">
                                    {errorMessage}
                                </div>
                            )}
                        <form onSubmit={formHandler} className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                                <input onChange={(event) => setUsername(event.target.value)} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required={true} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input onChange={(event) => setPassword(event.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required={true} />
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-zinc-600 hover:bg-zinc-700 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:focus:ring-zinc-800">
                                Sign in
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LoginForm;
