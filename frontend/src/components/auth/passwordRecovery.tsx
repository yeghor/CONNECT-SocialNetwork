import React, { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
    homeURI,
    AccessTokenCookieKey, RefreshTokenCookieKey,
    internalServerErrorURI,
    registerURI,
    loginURI,
    invalidEmailMessage,
    passwordNotSecureEnoughMessage,
    PasswordRecoveryLocationState
} from "../../consts.ts"

import { fetchRecoverPassword, fetchRequestPasswordRecovery } from "../../fetching/fetchAuth.ts"

import { Link } from "react-router-dom";
import SecondFactor from "./secondFactor.tsx";
import { validateFormString } from "../../helpers/validatorts.ts";
import { safeAPICallPublic } from "../../fetching/fetchUtils.ts";
import { AuthTokensResponse, EmailToConfirmResponse, SuccessfulResponse } from "../../fetching/DTOs.ts";
import { EmailInput, PasswordInput } from "../base/inputs.tsx";
import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler.ts";

export const PasswordRecoveryForm = () => {
    const navigate = useNavigate();

    const [ warningMessage, setWarningMessage ] = useState("");

    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const [ email, setEmail ] = useState("");

    const [ showSecondFactor, setShowSecondFactor ] = useState(false);

    const formHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateFormString(email, "email")) {
            setWarningMessage(invalidEmailMessage);
            return
        }

        const response = await safeAPICallPublic<EmailToConfirmResponse>(null, fetchRequestPasswordRecovery, navigate, setErrorMessage, email);
        
        if (response.success) {
            setShowSecondFactor(true);
        }
    }

    return (
        <div className="flex flex-col items-center justify-top mt-16 px-6 py-8 mx-auto md:h-screen lg:py-0">
            { showSecondFactor && email.length > 0 ? <SecondFactor emailToConfirm={email} _2FACase={"password-recovery"} /> :
                <div className="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                            Recover your password
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
                            <EmailInput setState={setEmail} />

                            <button
                                type="submit"
                                className="w-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                                <p className="text-white">Send code</p>
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


export const NewPasswordCreationRecovery = () => {
    const navigate = useNavigate();
    const locationState: PasswordRecoveryLocationState  = useLocation().state;

    const [ errorMessage, setErrorMessage ] = useState("");

    const [ newPassword, setNewPassword ] = useState("");
    const [ newPasswordConfirm, setNewPasswordConfirm ] = useState("");

    useEffect(() => {
        if (!locationState) {
            navigate(homeURI);
        }
    }, []);

    const submitHandler = async (event: FormEvent) => {
        event.preventDefault();

        const response = await safeAPICallPublic<AuthTokensResponse>(locationState.passwordRecoveryToken, fetchRecoverPassword, navigate, setErrorMessage, newPassword, newPasswordConfirm);

        if (response.success) {
            setUpdateCookie(AccessTokenCookieKey, response.accessToken, null);
            setUpdateCookie(RefreshTokenCookieKey, response.refreshToken, null);
            navigate(homeURI);
        }
    };

    return (
        <div className="flex flex-col items-center justify-top mt-16 px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
                        Recover your password
                    </h1>
                    
                        <p className="text-sm font-light text-red">
                            {errorMessage}
                        </p>

                    <form className="flex flex-col gap-8" onSubmit={(e) => submitHandler(e)}>
                        
                        <PasswordInput setState={setNewPassword} label={"New password"} placeHolder={null}/>
                        <PasswordInput setState={setNewPasswordConfirm} label={"Confirm new password"} placeHolder={null} />
                        <button
                            type="submit"
                            className="w-full bg-white/10 hover:bg-white/20 focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                            <p className="text-white">Change password</p>
                        </button>                 
                    </form>

                </div>
            </div>
        </div>
    );
};