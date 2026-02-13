import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { _2faURI, noAvatarImageMessage, tooManyAvatarFilesMessage } from "../../../consts";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../../helpers/cookies/cookiesHandler";
import { safeAPICall } from "../../../fetching/fetchUtils";
import { EmailToConfirmResponse } from "../../../fetching/DTOs";
import { fetchChangePassword } from "../../../fetching/fetchAuth";

const ManageProfileModal = (props: { avatarURL: string | null, setShowManageProfileModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate()
    const tokens = getCookiesOrRedirect(navigate)

    const modalRef = useRef<HTMLDivElement>(null);

    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);

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

    };

    const handleChangePassword = async () => {
        const response = await safeAPICall<EmailToConfirmResponse>(tokens, fetchChangePassword, navigate, undefined, newPassword, newPasswordConfirm);
        
        if (response.success) {
            navigate(_2faURI, { state: { emailToConfirm: response.emailToConfirm } });           
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
        <div ref={modalRef} className="bg-white/20 w-full text-white max-w-md rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Manage your profile</h2>
                <button onClick={() => props.setShowManageProfileModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-mediutext-gray-300">Avatar</label>
                    <div className="flex items-center gap-4">
                        <img className="h-12 rounded-full" src={newAvatar ? undefined : (props.avatarURL ? props.avatarURL : "/uknown-user-image.jpg")} />
                        <input 
                            onChange={(e) => handleLocalAvatarUpload(e)}
                            type="file" 
                            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold hover:file:bg-blue-100 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <hr className="border-gray-10" />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Username</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="New username"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-30 text-white focus:ring-2 outline-none transition-all"
                        />
                        <button className="px-4 py-2  text-white rounded-lg text-sm font-medium transition-colors">
                            Update username
                        </button>
                    </div>
                </div>

                <hr className="border-gray-10" />

                {/* Секция Пароля */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Password</label>
                    <input 
                        type="password" 
                        placeholder="New password"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button className="w-full py-2-whit text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                        Save new password
                    </button>
                </div>

                {warningMessage && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
                        {warningMessage}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 text-center bg-white/30">
                <button onClick={() => props.setShowManageProfileModal(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-white transition-colors">
                    Close
                </button>
            </div>
        </div>
    </div>
);
};

export default ManageProfileModal;