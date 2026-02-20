import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
    homeURI, internalServerErrorURI, loginURI,
    AccessTokenCookieKey, RefreshTokenCookieKey,
    passwordNotSecureEnoughMessage, invalidEmailMessage, invalidUsernameMessage
} from "../../consts"

import { fetchRegister } from "../../fetching/fetchAuth"
import { validateGETResponse } from "../../helpers/responseHandlers/getResponseHandlers.ts"

import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler"

import { validateFormString } from "../../helpers/validatorts"
import {Link} from "react-router-dom";
import SecondFactor from "./secondFactor.tsx";

const RegisterForm = () => {
    const navigate = useNavigate();

    const [ errorMessage, setErrorMessage ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");

    const [ emailToConfirm, setEmailToConfirm ] = useState<string | null>(null);
    const [ showSecondFactor, setShowSecondFactor ] = useState(false);

    const formHandler = async (event: React.FormEvent): Promise<void> => {
        event.preventDefault();

        if(!validateFormString(username, "username")) {
            setErrorMessage(invalidUsernameMessage);
            return;
            
        } else if(!validateFormString(email, "email")) {
            setErrorMessage(invalidEmailMessage);
            return;

        } else if(!validateFormString(password, "password")) {
            console.log("password is not secure enough: ", password);
            setErrorMessage(passwordNotSecureEnoughMessage);
            return;
        }

        // Manually calling fetchLogin, because safeApiCall doesn't provide interface to working without tokens object. In our case, on login we can't have it.
        try {
            const response = await fetchRegister(username, email, password);
            console.log(response)
            if(!validateGETResponse(response, setErrorMessage, navigate)) {
                return;
            }

            if(response.success) {
                setEmailToConfirm(response.email);
                setShowSecondFactor(true);
                return
            }
        } catch(err) {
            console.error(err);
            navigate(internalServerErrorURI);
            return;
        }
    }

    return (
        <div className="flex flex-col items-center justify-top mt-16 px-6 py-8 mx-auto lg:py-0">
            { (showSecondFactor && emailToConfirm) ? <SecondFactor emailToConfirm={emailToConfirm} /> :
                <div className="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                            Sign in to your account
                        </h1>
                            {errorMessage && (
                                <div className="mb-4 px-4 py-2 rounded text-red-300 border border-red-300 transition-all">
                                    {errorMessage}
                                </div>
                            )}
                        <form onSubmit={formHandler} className="space-y-4 md:space-y-6">
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-100 dark:text-white">Username</label>
                                <input onChange={(event) => setUsername(event.target.value)} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-100">Email</label>
                                <input onChange={(event) => setEmail(event.target.value)} type="text" name="email" id="email" placeholder="example@gmail.com" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-100 ">Password</label>
                                <input onChange={(event) => setPassword(event.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required={true} />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <p className="text-white">Sign up</p>
                            </button>
                            <p className="text-sm font-light text-gray-200 dark:text-gray-400">
                                Already have an account? <Link to={loginURI} className="font-medium text-primary-600 text-white hover:underline dark:text-primary-500 underline">Sign up</Link>
                            </p>
                        </form>
                    </div>
                </div>
            }
        </div>
    );
}

export default RegisterForm;
