import { BadResponse, SuccessfulResponse } from "../../fetching/DTOs.ts"
import {
    cooldownURI,
    internalServerErrorURI,
    notFoundURI
} from "../../consts.ts";
import { NavigateFunction } from "react-router-dom"

/*
This functions does NOT validate 401 code. Code 401 - returns true
*/
export const validateAPIResponse = (response: BadResponse | SuccessfulResponse, setErrorMessage?: CallableFunction, navigate?: NavigateFunction): boolean => {
    if (response.success || response.statusCode === 401) {
        return true;
    } else {
        if (response.statusCode === 500 || response.statusCode == 422) { 
            if (navigate) {
                navigate(internalServerErrorURI);                
            }
        } else if (response.statusCode === 404) {
            if (navigate) {
                navigate(notFoundURI);
            }
        
            return false;
        } else if (response.statusCode === 429) {
            if (navigate) {
                navigate(cooldownURI);
            }
        }
        if (setErrorMessage) {
            setErrorMessage(response.detail);
        }

        return false;
    }
}

