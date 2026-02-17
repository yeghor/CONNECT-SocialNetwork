import React, {StrictMode} from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import "./index.css"

import SocialHomePage from "./components/social/socialHomePage.tsx";
import ChatPage from "./components/social/chat/chatPage.tsx"
import ProfilePageWrapper from "./components/social/profile/profilePageWrapper.tsx";
import PostPage from './components/social/postPage.tsx';
import LoginForm from './components/auth/loginForm.tsx';
import RegisterForm from "./components/auth/registerForm.tsx"
import NavigationBar from "./components/base/navBar.tsx";
import Footer from "./components/base/footer.tsx";
import SearchPage from "./components/social/searchPage.tsx";
import SecondFactor from './components/auth/secondFactor.tsx';
import { PasswordRecoveryForm, NewPasswordRecoveryForm } from './components/auth/passwordRecovery.tsx';

const container = document.getElementById('root')

export const queryClient = new QueryClient();

if(container) {
    const root = ReactDOM.createRoot(container);

    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <div
                        className="min-h-screen w-full bg-cover bg-center"
                        style={{
                            backgroundImage: "url('/background.png')"
                        }}>
                        <div className='flex-1 flex flex-col'>
                            <NavigationBar />
                                <div className="overflow-auto">
                                    <Routes>
                                        <Route path='/' element={
                                            <SocialHomePage />
                                        }/>
                                        <Route path='/chats/' element={
                                            <ChatPage createNew={false} />
                                        }/>
                                        <Route path='/chats/:chatId' element={
                                            <ChatPage createNew={false} />
                                        }/>
                                        <Route path='/make-chat/:otherUserId' element={
                                            <ChatPage createNew={true} />
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
                                        <Route path='/auth/login' element={
                                            <LoginForm />
                                        } />
                                        <Route path='/auth/register' element={
                                            <RegisterForm />
                                        } />
                                        <Route path='/auth/password-recovery/email' element={
                                            <PasswordRecoveryForm />
                                        } />
                                        <Route path='/auth/password-recovery/password' element={
                                            <NewPasswordRecoveryForm />
                                        } />
                                        <Route path='/auth/2fa' element={
                                            <SecondFactor emailToConfirm={null} />
                                        } />
                                        <Route path='/search' element={
                                            <SearchPage />
                                        } />
                                    </Routes>
                                </div>
                        </div>
                        <Footer />
                    </div>
                </BrowserRouter>
            </QueryClientProvider>
        </StrictMode>
    );  

} else {
    throw new Error("Root container null!");
}

