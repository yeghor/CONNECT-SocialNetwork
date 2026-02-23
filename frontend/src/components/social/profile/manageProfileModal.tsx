import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { _2faURI, AccessTokenCookieKey, allowedImageMimeTypes, fileMimeTypeNotAllowed, invalidUsernameMessage, noAvatarImageMessage, passwordNotSecureEnoughMessage, passwordRecoveryURI, RefreshTokenCookieKey, tooManyAvatarFilesMessage } from "../../../consts";
import { useNavigate, Link } from "react-router";
import { getCookieTokens, setUpdateCookie } from "../../../helpers/cookies/cookiesHandler";
import { safeAPICallPrivate } from "../../../fetching/fetchUtils";
import { AuthTokensResponse, EmailToConfirmResponse, SuccessfulResponse } from "../../../fetching/DTOs";
import { fetchChangePassword, fetchChangeUsername } from "../../../fetching/fetchAuth";
import { validateFormString } from "../../../helpers/validatorts";
import { fetchUploadAvatar } from "../../../fetching/fetchMedia";

const ManageProfileModal = (props: { avatarURL: string | null, setShowManageProfileModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate()
    const tokens = getCookieTokens(navigate)

    const modalRef = useRef<HTMLDivElement>(null);

    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);
    const [ usernameStatusMessage, setUsernameStatusMessage ] = useState<string | null>(null);
    const [ changePasswordStatusMessage, setChangePasswordStatusMessage ] = useState<string | null>(null);
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);

    const [ allowChangePassword, setAllowChangePassword ] = useState(true);
    const [ allowChangeUsername, setAllowChangeUsername ] = useState(true);
    const [ allowChangeAvatar, setAllowChangeAvatar ] = useState(false);

    const [ newUsername, setNewUsername ] = useState("");
    const [ oldPassword, setOldPassword ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");

    const [ newAvatarFile, setNewAvatar ] = useState<File | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                props.setShowManageProfileModal(false);
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangeUsername = async () => {
        if (!validateFormString(newUsername, "username")) {
            setWarningMessage(invalidUsernameMessage);
            return;
        } else if (!allowChangeUsername) {
            return;
        }

        const response = await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchChangeUsername, navigate, setErrorMessage, newUsername);

        if (response.success) {
            setUsernameStatusMessage("Username changed successfully!")
            setNewUsername("");
            setAllowChangeUsername(false);
        }
    };

    const handleChangePassword = async () => {
        if (!validateFormString(newPassword, "password")) {
            setWarningMessage(passwordNotSecureEnoughMessage);
        } else if (oldPassword === newPassword) {
            setWarningMessage("Your new password cannot be same as old one");
        } else if (!allowChangePassword) {
            return
        }

        setWarningMessage(null);

        const response = await safeAPICallPrivate<AuthTokensResponse>(tokens, fetchChangePassword, navigate, setWarningMessage, oldPassword, newPassword);
        
        if (response.success) {
            setUpdateCookie(AccessTokenCookieKey, response.accessToken, null);
            setUpdateCookie(RefreshTokenCookieKey, response.refreshToken, null);
            
            setNewPassword("");
            setOldPassword("");
            setChangePasswordStatusMessage("Your password changed succesfully.");
            setAllowChangePassword(false);
        }
    };

    const handleLocalAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            setWarningMessage(noAvatarImageMessage);
            return;
        } else if (e.target.files.length > 1) {
            setWarningMessage(tooManyAvatarFilesMessage);
            return;
        } else if (!(allowedImageMimeTypes.includes(e.target.files[0].type))) {
            setWarningMessage(fileMimeTypeNotAllowed);
            const element = document.getElementById("avatarInput") as HTMLInputElement;
            element.value = "";
            return;
        }
        
        setWarningMessage(null);

        if (e.target.files) {
            setNewAvatar(e.target.files[0]);
            setAllowChangeAvatar(true)
        }
    };

    const handleChangeAvatar = async () => {
        console.log("handling avatar upload, ", newAvatarFile)
        if (!newAvatarFile || !allowChangeAvatar) {
            return;
        }
        console.log(newAvatarFile)
        // File inherits from Blob, we don't need to convert it
        await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchUploadAvatar, navigate, setWarningMessage, newAvatarFile)
    };

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div ref={modalRef} className="bg-white/10 w-full text-white max-w-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-semibold text-white/90">Manage your profile</h2>
                <button 
                    onClick={() => props.setShowManageProfileModal(false)} 
                    className="text-white/50 hover:text-white transition-colors p-1"
                >
                    ✕
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Avatar</label>
                    <div className="flex items-center gap-4">
                        <img 
                            className="h-14 w-14 rounded-full border-2 border-white/20 object-cover" 
                            // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
                            src={newAvatarFile ? URL.createObjectURL(newAvatarFile) : (props.avatarURL ? props.avatarURL : "/uknown-user-image.jpg")} 
                        />
                        <input 
                            id="avatarInput"
                            onChange={(e) => handleLocalAvatarUpload(e)}
                            type="file"
                            className="block w-full text-sm text-white/60 
                                file:mr-4 file:py-2 file:px-4 
                                file:rounded-full file:border-0 file:text-sm
                                file:bg-white/10 file:text-white 
                                hover:file:bg-white/20 transition-all cursor-pointer"
                        />
                        <button disabled={!allowChangeAvatar} onClick={() => handleChangeAvatar()} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-sm transition-all border border-white/10 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:grayscale disabled:opacity-40">
                            Update
                        </button>
                    </div>
                </div>

                <hr className="border-white/10" />

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Username</label>
                    <p className="py-2 text-white">{usernameStatusMessage}</p>
                    <div className="flex gap-2">
                        <input 
                            disabled={!allowChangeUsername}
                            type="text" 
                            placeholder="New username"
                            onChange={(e) => setNewUsername(e.target.value)}
                            value={newUsername}
                            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30 disabled:opacity-40  disabled:cursor-not-allowed"
                        />
                        <button disabled={!allowChangeUsername} onClick={() => handleChangeUsername()} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-sm transition-all border border-white/10 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:grayscale disabled:opacity-40">
                            Update
                        </button>
                    </div>
                </div>

                <hr className="border-white/10" />

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Security</label>
                    <p className="py-2 text-white">{changePasswordStatusMessage}</p>
                    <input 
                        disabled={!allowChangePassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        type="password" 
                        placeholder="Old password"
                        value={oldPassword}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    />

                    <input 
                        disabled={!allowChangePassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password" 
                        placeholder="New password"
                        value={newPassword}
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    />

                    <button 
                        disabled={!allowChangePassword}
                        onClick={() => handleChangePassword()} 
                        className="w-full py-2.5 bg-white/10 rounded-lg text-sm font-semibold hover:bg-white/20 transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:active:scale-100"
                    >
                        Change Password
                    </button>
                    <Link to={passwordRecoveryURI} className="text-sm text-gray-200 underline">Forgot your old password?</Link>
                </div>

                {warningMessage ? (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-lg animate-pulse">
                        {warningMessage}
                    </div>
                ) : <div className="p-3"></div> } {/* To prevent layout jumping */}
            </div>

            <div className="px-6 py-4 text-center bg-white/5 border-t border-white/10">
                <button 
                    onClick={() => props.setShowManageProfileModal(false)} 
                    className="px-4 py-2 text-sm font-medium text-white/40 hover:text-white transition-colors"
                >
                    Close settings
                </button>
            </div>
        </div>
    </div>
);
};

export default ManageProfileModal;