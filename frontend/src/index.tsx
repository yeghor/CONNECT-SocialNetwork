import React, {StrictMode} from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import "./index.css"

import SocialHomePage from "./components/social/socialHomePage.tsx";
import ChatPage from "./components/social/chat/chatPage.tsx"
import ProfilePageWrapper from "./components/social/profilePageWrapper.tsx";
import PostPage from './components/social/postPage.tsx';
import LoginForm from './components/auth/loginForm.tsx';
import RegisterForm from "./components/auth/registerForm.tsx"
import NavigationBar from "./components/base/navBar.tsx";
import Footer from "./components/base/footer.tsx";
import SearchPage from "./components/social/searchPage.tsx";
import {MyProfilePage} from "./components/social/profilePage.tsx";

const container = document.getElementById('root')

export const queryClient = new QueryClient();

if(container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        // <StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <div
                        className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col"
                        style={{
                            backgroundImage: "url('/background.png')"
                        }}>
                        <NavigationBar />
                            <Routes>
                                <Route path='/' element={
                                    <SocialHomePage />
                                }/>
                                <Route path='/chat/:chatId' element={
                                    <ChatPage />
                                }/>
                                <Route path='/my-profile' element={
                                    <ProfilePageWrapper />
                                } />
                                <Route path='/profile/:userId' element={
                                    <ProfilePageWrapper />
                                } />
                                <Route path='/post/:postId' element={
                                    <PostPage />
                                } />
                                <Route path='/login' element={
                                    <LoginForm />
                                } />
                                <Route path='/register' element={
                                    <RegisterForm />
                                } />
                                <Route path="/search" element={
                                    <SearchPage />
                                } />
                            </Routes>
                        <Footer />
                    </div>
                </BrowserRouter>
            </QueryClientProvider>
        // </StrictMode>
    );

} else {
    throw new Error("Root container null!");
}

