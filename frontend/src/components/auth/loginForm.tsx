import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
    homeURI,
    AccessTokenCookieKey, RefreshTokenCookieKey,
    registerURI,
    passwordRecoveryURI
} from "../../consts.ts"

import { fetchLogin } from "../../fetching/fetchAuth.ts"

import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler.ts"
import { Link } from "react-router-dom";
import SecondFactor from "./secondFactor.tsx";
import WarningMessage from "../base/warningMessage.tsx";
import { safeAPICallNoToken } from "../../fetching/fetchUtils.ts";
import { AuthTokensResponse } from "../../fetching/DTOs.ts";
import LoadingIndicator from "../base/centeredLoadingIndicator.tsx";

const LoginForm = () => {
    const navigate = useNavigate();

    const [ errorMessage, setErrorMessage ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");

    const [ emailToConfirm, setEmailToConfirm ] = useState<string | null>(null);
    const [ showSecondFactor, setShowSecondFactor ] = useState(false);
    const [ showLoading, setShowLoading ] = useState(false);

    const formHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        
        setShowLoading(true);
        setErrorMessage("");

        try {
            const response = await safeAPICallNoToken<AuthTokensResponse>(fetchLogin, navigate, setErrorMessage, username, password);
    
            if (response.success) {
                console.log("SHISH", response.expiresAtRefreshToken)
                if (response.emailToConfirm) {
                    setEmailToConfirm(response.emailToConfirm);
                    setShowSecondFactor(true);
                } else {
                    setUpdateCookie(AccessTokenCookieKey, response.accessToken, response.expiresAtAccessToken);
                    setUpdateCookie(RefreshTokenCookieKey, response.refreshToken, response.expiresAtRefreshToken);
                    navigate(homeURI);                    
                }
            } else {
                setErrorMessage(response.detail);
            }        
        } finally {
            setShowLoading(false);
        }

    }

    return (
        <div className="flex flex-col h-screen items-center justify-top mt-16 px-6 py-8 mx-auto lg:py-0">
            { showSecondFactor && emailToConfirm ? <SecondFactor emailToConfirm={emailToConfirm} _2FACase="email-confirmation" /> :
                    ( showLoading ? <LoadingIndicator centerY={false} customMessage="Processing login data..." /> : <div className="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                            Sign in to your account
                        </h1>
                            {errorMessage && (
                                <WarningMessage message={errorMessage} />
                            )}
                        <form onSubmit={formHandler} className="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-100 dark:text-white">Username</label>
                                <input onChange={(event) => setUsername(event.target.value)} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-100 dark:text-white">Password</label>
                                <input onChange={(event) => setPassword(event.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <p className="text-white">Sign in</p>
                            </button>
                            <p className="text-sm font-light text-gray-200 dark:text-gray-400">
                                Don’t have an account yet? <Link to={registerURI} className="font-medium text-primary-600 text-white hover:underline dark:text-primary-500 underline">Sign up</Link>
                            </p>
                            <p className="text-sm font-light text-gray-200 dark:text-gray-400">
                                Forgot password? <Link to={passwordRecoveryURI} className="font-medium text-primary-600 text-white hover:underline dark:text-primary-500 underline">Password Recovery</Link>
                            </p>
                        </form>
                    </div>
                </div>) }
        </div>
    );
}

export default LoginForm;
