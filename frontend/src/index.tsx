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
import PendingChat from './components/social/chat/active_chats/pendingChag.tsx';
import MakeNewChat from './components/social/chat/active_chats/makeNewChat.tsx';

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

