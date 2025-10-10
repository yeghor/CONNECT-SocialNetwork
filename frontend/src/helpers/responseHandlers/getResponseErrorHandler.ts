import { BadResponse, SuccessfullResponse } from "../../fetching/responseDTOs.ts"
import { RedirectFunction } from "react-router-dom"

export const validateResponse = (response: BadResponse | SuccessfullResponse, setErrorMessage?: Function, redirect?: RedirectFunction): boolean => {
    if (response.success) {
        return true;
    } else {
        if (response.statusCode == 500) { 
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
