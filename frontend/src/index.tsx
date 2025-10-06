import React from 'react';
import ReactDOM from 'react-dom/client';
import BaseComponentsWrapper from "./components/pageUtils.tsx";
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import SocialPage from "./components/social/socialPage.tsx"
import ChatPage from "./components/social/chatPage.jsx"
import MyProfilePage from './components/social/myProfilePage.tsx';
import ProfilePage from './components/social/profilePage.tsx';
import PostPage from './components/social/postPage.tsx';

const container = document.getElementById('root')

if(container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <BrowserRouter>
            <React.StrictMode>
                <Routes>
                    <Route path='/' element={
                        <BaseComponentsWrapper>
                            <SocialPage />
                        </BaseComponentsWrapper>
                    }/>
                    <Route path='/chat' element={
                        <BaseComponentsWrapper>
                            <ChatPage />
                        </BaseComponentsWrapper>
                    }/>
                    <Route path='/my-profile' element={
                        <BaseComponentsWrapper>
                            <MyProfilePage />
                        </BaseComponentsWrapper>
                    } />
                    <Route path='/profile/:userId' element={
                        <BaseComponentsWrapper>
                            <ProfilePage />
                        </BaseComponentsWrapper>
                    } />
                    <Route path='/post/:postId' element={
                        <BaseComponentsWrapper>
                            <PostPage />
                        </BaseComponentsWrapper>
                    } />
                </Routes>
            </React.StrictMode>        
        </BrowserRouter>
    );

} else {
    throw new Error("Root container null!");
}

