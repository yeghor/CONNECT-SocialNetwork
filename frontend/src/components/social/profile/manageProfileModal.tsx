import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { _2faURI, invalidUsernameMessage, noAvatarImageMessage, tooManyAvatarFilesMessage } from "../../../consts";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler";
import { safeAPICall } from "../../../fetching/fetchUtils";
import { EmailToConfirmResponse, SuccessfulResponse } from "../../../fetching/DTOs";
import { fetchChangePassword, fetchChangeUsername } from "../../../fetching/fetchAuth";
import { validateFormString } from "../../../helpers/validatorts";

const ManageProfileModal = (props: { avatarURL: string | null, setShowManageProfileModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate()
    const tokens = getCookiesOrRedirect(navigate)

    const modalRef = useRef<HTMLDivElement>(null);

    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);
    const [ usernameStatusMessage, setUsernameStatusMessage ] = useState<string | null>(null);
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);

    const [ newUsername, setNewUsername ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");
    const [ newPasswordConfirm, setNewPasswordConfirm ] = useState("");

    const [ newAvatar, setNewAvatar ] = useState<File | null>(null);

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
        }

        const response = await safeAPICall<SuccessfulResponse>(tokens, fetchChangeUsername, navigate, setErrorMessage, newUsername);

        if (response.success) {
            setUsernameStatusMessage("Username changed successfully!")
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== newPasswordConfirm) {
            setWarningMessage("Passwords didn't match!");
            return;
        }

        const response = await safeAPICall<EmailToConfirmResponse>(tokens, fetchChangePassword, navigate, undefined, newPassword, newPasswordConfirm);
        
        if (response.success) {
            navigate(`../${_2faURI}`, { state: { emailToConfirm: response.email } });           
        }
    };

    const handleLocalAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            setWarningMessage(noAvatarImageMessage);
        } else if (e.target.files.length > 1) {
            setWarningMessage(tooManyAvatarFilesMessage);
        }
    };

    const handleChangeAvatar = () => {

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
                            src={newAvatar ? undefined : (props.avatarURL ? props.avatarURL : "/uknown-user-image.jpg")} 
                        />
                        <input 
                            onChange={(e) => handleLocalAvatarUpload(e)}
                            type="file" 
                            className="block w-full text-sm text-white/60 
                                file:mr-4 file:py-2 file:px-4 
                                file:rounded-full file:border-0 
                                file:text-sm file:font-semibold 
                                file:bg-white/10 file:text-white 
                                hover:file:bg-white/20 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <hr className="border-white/10" />

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Username</label>
                    <p className="py-2 text-white">{usernameStatusMessage}</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="New username"
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                        />
                        <button onClick={() => handleChangeUsername()} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all border border-white/10">
                            Update
                        </button>
                    </div>
                </div>

                <hr className="border-white/10" />

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Security</label>
                    <input 
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password" 
                        placeholder="New password"
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                    />
                    <input 
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        type="password" 
                        placeholder="Confirm password"
                        className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:bg-white/10 focus:ring-1 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                    />
                    <button 
                        onClick={() => handleChangePassword()} 
                        className="w-full py-2.5 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Change password
                    </button>
                </div>

                {warningMessage && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-200 text-xs rounded-lg animate-pulse">
                        {warningMessage}
                    </div>
                )}
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