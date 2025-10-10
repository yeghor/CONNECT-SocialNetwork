import { BadResponse, SuccessfullResponse } from "../../fetching/responseDTOs.ts"
import { NavigateFunction } from "react-router-dom"

export const validateResponse = (response: BadResponse | SuccessfullResponse, setErrorMessage?: Function, redirect?: NavigateFunction): boolean => {
    if (response.success) {
        return true;
    } else {
        if (response.statusCode === 500) { 
            if (redirect) {
                redirect("");
                return false;                
            }
        };

        if (setErrorMessage) {
            setErrorMessage(response.detail);
        }        
        return false;
    }
}
