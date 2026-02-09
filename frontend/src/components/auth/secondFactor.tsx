import React, { useState, useEffect, ChangeEvent } from "react";
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
    const [ confirmationCodeArr, setConfirmationCode ] = useState<string[]>([]);

    const handleFocusKeyPress = (event: ChangeEvent<HTMLInputElement>, elementIndex: number) => {
        const currElement = document.getElementById(String(elementIndex)) as HTMLInputElement;
        
        const nextElement = document.getElementById(String(elementIndex + 1)) as HTMLInputElement | null;

        if (event.target.value) {
            currElement.value = event.target.value[event.target.value.length - 1];
            nextElement?.focus();
            return;
        }
        
        if (currElement.value) {
            nextElement?.focus();
        }
        
        setConfirmationCode((prevState) => [...prevState, event.target.value]);            
    };

    const handleBackspace = (event: KeyboardEvent) => {
        if (event.key === "Backspace") {
            console.log(event.key)
            const currElement = document.activeElement as HTMLInputElement;
            if (currElement && currElement.value === "") {
                if (currElement.id !== "0") {
                    setTimeout(() => document.getElementById(String(Number(currElement.id) - 1))?.focus(), 25);
                }
            }
        }

        setConfirmationCode((prevState) => [...prevState.slice(0, elementIndex), event.target.value, ...prevState.slice(elementIndex + 1, prevState.length)]);
    }

    const handlePast = (event: ClipboardEvent) => {
        let pasteString = event.clipboardData?.getData("text");
        const currElement = document.activeElement as HTMLInputElement;
        let activeElemIdx = Number(currElement?.id ?? 0);
        let pasteIdx = 0;
        if (pasteString) {
            for (let i = activeElemIdx; i < 6; i++) {
                let activeElementLoop = document.getElementById(String(i)) as HTMLInputElement;
                if (activeElementLoop && pasteIdx < pasteString.length) {
                    activeElementLoop.value = pasteString[pasteIdx];
                }
                if (pasteIdx < pasteString.length) {
                    activeElementLoop.focus()
                }
                pasteIdx++;
            }     
        }
    }

    useEffect(() => {
        document.getElementById("0")?.focus();
        window.addEventListener("keydown", handleBackspace);
        window.addEventListener("paste", handlePast);
        return () => {
            window.removeEventListener("keydown", handleBackspace);
            window.removeEventListener("paste", handlePast);
        }
    }, []);

    const sendCode = async () => {
        if (confirmationCodeArr.length < 6) {
            setErrorMesage("Uhhhhmmmm... BIMBIM BAMBAM");
            return;
        }

        const joinedConfirmationCode = confirmationCodeArr.join("");

        try {
            const response = await fetchConfirmSecondFactor(joinedConfirmationCode, props.emailToConfirm);

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
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <header>
                <h2 className="text-2xl font-bold">Please, confirm your email</h2>
                <p className="text-slate-400 mt-2">Enter 6-digit code, sent to your email: {props.emailToConfirm}</p>
                </header>

                <div className="flex justify-between gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                            key={idx}
                            id={String(idx)}
                            maxLength={2}
                            onChange={(e) => handleFocusKeyPress(e, idx)}
                            className={`w-12 h-16 text-center text-2xl font-semibold 
                                bg-white/10 border border-white/20 rounded-lg 
                                border-white focus:ring-2 focus:shadow-white ring-white/50
                                outline-none transition-all duration-200
                            `}
                        />
                    ))}
                </div>

                <button onClick={async () => await sendCode()} className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-lg font-medium transition-all">
                    Confirm
                </button>
            </div>
            </div>
    );
}

export default SecondFactor;