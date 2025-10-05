import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./components/app.tsx";
import { BrowserRouter, Route, Routes } from "react-router"

const container = document.getElementById('root')

if(container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <BrowserRouter>
            <React.StrictMode>
                <Routes>
                    <Route path="/" element={<App />}/>                    
                </Routes>
            </React.StrictMode>        
        </BrowserRouter>
    );

} else {
    throw new Error("Root container null!");
}

