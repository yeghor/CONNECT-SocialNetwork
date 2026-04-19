import React, { StrictMode, createContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// @ts-ignore
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
import { PasswordRecovery2FAForm, NewPasswordCreationRecovery } from './components/auth/passwordRecovery.tsx';
import NotFoundPage from './components/base/errorPages/nofFound.tsx';
import { AccessTokenCookieKey, cooldownURI, internalServerErrorURI, RefreshTokenCookieKey } from './consts.ts';
import InternalServerError from './components/base/errorPages/internalServerError.tsx';
import Cooldown from './components/base/errorPages/cooldown.tsx';

import { useNavigate } from 'react-router-dom';
import { CookieTokenObject, getCookieTokens, removeCookie, setUpdateCookie } from './helpers/cookies/cookiesHandler.ts';

const container = document.getElementById('root')

export const queryClient = new QueryClient();

interface CookieTokensContext {
    "tokens": CookieTokenObject,
    "setTokens": (access: string | null, refresh: string | null, accessExpiry: Date | null, refreshExpiry: Date | null) => void
    "removeTokens": () => void
}

// Dummy data
export const TokensContext = createContext<CookieTokensContext>({"tokens": { "access": undefined, "refresh": undefined }, "setTokens": () => {}, "removeTokens": () => {}});

interface TokenContextWrapperProps {
    "children": React.ReactNode
}

const TokensContextWrapper = (props: TokenContextWrapperProps) => {
    const [ tokens, setTokensState ] = useState<CookieTokenObject>(getCookieTokens(undefined));

    const setTokens = (access: string | null, refresh: string | null, accessExpiry: Date | null, refreshExpiry: Date | null,) => {
        if (access && accessExpiry) {
            setUpdateCookie(AccessTokenCookieKey, access, accessExpiry);            
        }
        if (refresh && refreshExpiry) {
            setUpdateCookie(RefreshTokenCookieKey, refresh, refreshExpiry);
        }
        if (access && refresh) {
            setTokensState({
                "access": access,
                "refresh": refresh
            });            
        }
    }

    const removeTokens = () => {
        removeCookie(AccessTokenCookieKey);
        removeCookie(RefreshTokenCookieKey);
    }

    return (
        <TokensContext value={{
            "tokens": tokens,
            "setTokens": setTokens,
            "removeTokens": removeTokens
        }}>
            {props.children}
        </TokensContext>
    );
};

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
                                    <TokensContextWrapper>
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
                                            <Route path='/auth/password-recovery' element={
                                                <PasswordRecovery2FAForm />
                                            } />
                                            <Route path='/auth/password-recovery/password' element={
                                                <NewPasswordCreationRecovery />
                                            } />
                                            <Route path='/auth/2fa' element={
                                                <SecondFactor emailToConfirm={null} _2FACase={"email-confirmation"} />
                                            } />
                                            <Route path='/search' element={
                                                <SearchPage />
                                            } />
                                            <Route path={internalServerErrorURI} element={
                                                <InternalServerError />                                            
                                            } />
                                            <Route path={cooldownURI} element={
                                                <Cooldown />                                            
                                            } />

                                            <Route path='*' element={<NotFoundPage />} />
                                        </Routes>
                                    </TokensContextWrapper>
                                </div>
                            <Footer />
                        </div>
                    </div>
                </BrowserRouter>
            </QueryClientProvider>
        </StrictMode>
    );  

} else {
    throw new Error("Root container null!");
}

