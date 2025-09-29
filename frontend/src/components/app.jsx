import React, { useEffect } from "react";
import "../index.css"
import { fetchLogin, fetchChangePassword } from "../fetching/fetchAuth.ts"

const App = () => {

    useEffect(() => {
        const fetcher = async () => {
            const response = await fetchChangePassword("JavaScriptEnjoyer", "password1A")

            if(response.success) {
                console.log("Succes!")
                console.log(response.accessToken);
            } else {
                console.log(response.detail);
            }
        }
        fetcher();
    })

    return (
        <div>
            <p className="text-3xl font-bold underline">Hello World!</p>
        </div>
    )
}

export default App;