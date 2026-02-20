import React from "react";

type ReactSetStringState = React.Dispatch<React.SetStateAction<string>>

export const EmailInput = (props: { setState: ReactSetStringState }) => {
    return(
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-100">
                Your email
            </label>
            <input 
                onChange={(event) => props.setState(event.target.value)} 
                type="email" 
                name="email"  
                placeholder="example@gmail.com"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                required={true} 
            />
        </div>
    );
};

export const PasswordInput = (
    props: {
        setState: ReactSetStringState,
        placeHolder: string | null,
        label: string
    }) => {
    return(
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-100">
                {props.label}
            </label>
            <input 
                onChange={(event) => props.setState(event.target.value)} 
                type="password" 
                name="password" 
                placeholder={props.placeHolder ??  "••••••••"}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                required={true} 
            />
        </div>
    );
};
