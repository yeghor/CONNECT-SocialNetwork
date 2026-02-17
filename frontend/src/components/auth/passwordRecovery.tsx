import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
    homeURI,
    AccessTokenCookieKey, RefreshTokenCookieKey,
    internalServerErrorURI,
    registerURI,
    loginURI,
    invalidEmailMessage,
    passwordNotSecureEnoughMessage
} from "../../consts.ts"

import { fetchLogin, fetchRecoverPassword } from "../../fetching/fetchAuth.ts"

import { validateGETResponse } from "../../helpers/responseHandlers/getResponseHandlers.ts"

import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler.ts"
import { Link } from "react-router-dom";
import SecondFactor from "./secondFactor.tsx";
import { validateFormString } from "../../helpers/validatorts.ts";
import { safeAPICall, safeAPICallPublic } from "../../fetching/fetchUtils.ts";
import { SuccessfulResponse } from "../../fetching/DTOs.ts";

export const PasswordRecoveryForm = () => {
    const navigate = useNavigate();

    const [ warningMessage, setWarningMessage ] = useState("");

    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const [ email, setEmail ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");

    const [ showSecondFactor, setShowSecondFactor ] = useState(false);

    const formHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateFormString(email, "email")) {
            setWarningMessage(invalidEmailMessage);
            return
        } else if (!validateFormString(newPassword, "password")) {
            setWarningMessage(passwordNotSecureEnoughMessage);
            return
        }

        const response = await safeAPICallPublic<SuccessfulResponse>(null, fetchRecoverPassword, navigate, setErrorMessage, email, newPassword);
        
        if (response.success) {
            setShowSecondFactor(true);
        }
    }

    return (
        <div className="flex flex-col items-center justify-top mt-16 px-6 py-8 mx-auto md:h-screen lg:py-0">
            { showSecondFactor && email.length > 0 ? <SecondFactor emailToConfirm={email} /> :
                <div className="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                            Reset your password
                        </h1>
                        
                        <p className="text-sm font-light text-gray-200">
                            Enter your email address and new password.
                        </p>

                        {errorMessage && (
                            <div className="mb-4 px-4 py-2 rounded text-red-300 border border-red-300 text-sm">
                                {errorMessage}
                            </div>
                        )}
                        
                        <form onSubmit={formHandler} className="space-y-4 md:space-y-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-100">
                                    Your email
                                </label>
                                <input 
                                    onChange={(event) => setEmail(event.target.value)} 
                                    type="email" 
                                    name="email"  
                                    placeholder="example@gmail.com"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    required={true} 
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-100">
                                    New password
                                </label>
                                <input 
                                    onChange={(event) => setNewPassword(event.target.value)} 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    required={true} 
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                                <p className="text-white">Recover password</p>
                            </button>

                            <p className="text-sm font-light text-gray-200">
                                Remembered your password? <Link to={loginURI} className="font-medium text-white hover:underline underline">Back to sign in</Link>
                            </p>
                        </form>
                    </div>
                </div>
            }
        </div>
    );
};

export const NewPasswordRecoveryForm = () => {
    return (
        <div>

        </div>
    );
};