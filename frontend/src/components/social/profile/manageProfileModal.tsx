import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { noAvatarImageMessage, tooManyAvatarFilesMessage } from "../../../consts";

const ManageProfileModal = (props: { setShowManageProfileModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const [ warningMessage, setWarningMessage ] = useState<string | null>(null);

    const [ newUsername, setNewUsername ] = useState("");
    const [ newPassword, setNewPassword ] = useState("");
    const [ newPasswordConfirm, setNewPasswordConfirm ] = useState("");

    const [ newAvatar, setNewAvatar ] = useState("");

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                props.setShowManageProfileModal(false);
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangeUsername = () => {

    };

    const handleChangePassword = () => {

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

    return(
        <div ref={modalRef}>

        </div>
    );
};

export default ManageProfileModal;