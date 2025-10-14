import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import BaseComponentsWrapper from "./components/pageUtils.tsx";
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import "./index.css"

import SocialPage from "./components/social/socialPage.tsx"
import ChatPage from "./components/social/chatPage.tsx"
import MyProfilePage from './components/social/myProfilePage.tsx';
import ProfilePage from './components/social/profilePage.tsx';
import PostPage from './components/social/postPage.tsx';
import LoginForm from './components/auth/loginForm.tsx';
import RegisterForm from "./components/auth/registerForm.tsx"
import NavigationBar from "./components/base/navBar.tsx";
import Footer from "./components/base/footer.tsx";

const container = document.getElementById('root')

if(container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <StrictMode>
            <BrowserRouter>
                <div
                    className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col"
                    style={{
                        backgroundImage: "url('/background.png')"
                    }}
                >
                    <NavigationBar />
                        <Routes>
                            <Route path='/' element={
                                <SocialPage />
                            }/>
                            <Route path='/chat' element={
                                <ChatPage />
                            }/>
                            <Route path='/my-profile' element={
                                <MyProfilePage />
                            } />
                            <Route path='/profile/:userId' element={
                                <ProfilePage />
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
                        </Routes>
                    <Footer />
                </div>
            </BrowserRouter>
        </StrictMode>
    );

} else {
    throw new Error("Root container null!");
}

