import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { fetchConfirmSecondFactor } from "../../fetching/fetchAuth";
import { validateGETResponse } from "../../helpers/responseHandlers/getResponseHandlers";
import { AccessTokenCookieKey, appHomeURI, internalServerErrorURI, RefreshTokenCookieKey } from "../../consts";
import { setUpdateCookie } from "../../helpers/cookies/cookiesHandler";

interface SecondFactorProps {
    emailToConfirm: string
}

const SecondFactor = (props: SecondFactorProps) => {
    const navigate = useNavigate();

    const [ errorMessage, setErrorMesage ] = useState<string | null>(null);

    const [ confirmationCode, setConfirmationCode ] = useState("");
    const [ activeInput, setActiveInput ] = useState(0);
    
    const handleKeyPress = (event: KeyboardEvent) => {
        console.log(event.key)
        console.log(activeInput)
        if (event.key === "Backspace") {
            if (activeInput > 0) {
                setConfirmationCode((prevState) => prevState.slice(0, activeInput-1));
                setActiveInput((prevState) => prevState-1);                 
            }
        } else {
            if (activeInput > 5) {
                return;
            }
            setConfirmationCode((prevState) => prevState + event.key);
            setActiveInput((prevState) => {
                return prevState + 1;
            });
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [activeInput, confirmationCode]); // To update event listener function when activeInput of confirmationCode change

    const sendCode = async () => {
        if (!confirmationCode) {
            setErrorMesage("Uhhhhmmmm...");
            return;
        }
        
        try {
            const response = await fetchConfirmSecondFactor(confirmationCode, props.emailToConfirm);

            if(!validateGETResponse(response, setErrorMesage, navigate)) {
                return;
            }

            if(response.success) {
                setUpdateCookie(AccessTokenCookieKey, response.accessToken);
                setUpdateCookie(RefreshTokenCookieKey, response.refreshToken);
                navigate(appHomeURI);
            }
        } catch(err) {
            console.error(err);
            navigate(internalServerErrorURI);
            return;
        }
        }

    return(
        <div className="flex flex-col items-center justify-center min-h-scree text-white p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <header>
                <h2 className="text-2xl font-bold">Please, confirm your email</h2>
                <p className="text-slate-400 mt-2">Enter 6-digit code, sent on your email: {props.emailToConfirm}</p>
                </header>

                <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className={`w-12 h-16 text-center text-2xl font-semibold 
                                    bg-white/10 border border-white/20 rounded-lg 
                                    ${ activeInput === index && "border-white focus:ring-2 ring-white/50"} 
                                    outline-none transition-all duration-200`}
                    >{confirmationCode[index] ?? null}</div>
                ))}
                </div>

                <button onClick={async () => await sendCode()} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors">
                    Confirm
                </button>
            </div>
            </div>
    );
}

export default SecondFactor;