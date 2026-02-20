interface BaseHeaderType {
    [key: string]: string
}

type TokenHeaderType = BaseHeaderType & {
    "token": string;
    [key: string]: string
}

const createBearerToken = (token: string) => `Bearer ${token}`;

export const requestHeaders = (): BaseHeaderType => {
    return {
        "Content-Type": "application/json",
    };
};

export const requestTokenHeaders = (JWT: string): TokenHeaderType => {
    return {
        "Content-Type": "application/json",
        "token": createBearerToken(JWT)
    };
};

// For files
export const requestTokenMultipartHeaders = (JWT: string): TokenHeaderType => {
    return {
        // https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
        // Not setting Content-type to prevent - Missing boundary in multipart/form-data from the backend
        //@ts-ignore
        "token": createBearerToken(JWT)
    };
};


interface LoginInterface {
    password: string
    username: string
};

interface RegisterBody extends LoginInterface {
    email: string
};

interface LogoutInterface {
    access_token: string,
    refresh_token: string
};

interface ChangePostBody {
    title: string
    text: string
};

interface MakePostBody extends ChangePostBody {
    parent_post_id: string | null
};

interface ChangePasswordBody {
    old_password: string,
    new_password: string
};

interface RecoverPasswordBody {
    new_password: string
    new_password_confirm: string
};

interface ChangeUsernameBody {
    new_username: string
};

interface EmailToConfirmBody {
    email: string
}

interface ConfirmSecondFactorBody extends EmailToConfirmBody {
    confirmation_code: string
}

interface CreateChatBody { 
    message: string,
};

interface CreateDialogueBody extends CreateChatBody {
    other_participant_id: string
};

interface CreateGroupBody {
    other_participants_ids: string[]
};

interface PasswordRecoveryBody {
    new_password: string
    new_password_confirm: string
}

interface EmailProvidedBody {
    email: string
}

export const makePostBody = (title: string, text: string, parentPostId: string | null): MakePostBody => {
    return {
        title,
        text,
        parent_post_id: parentPostId
    };
};

export const changePostBody = (title: string, text: string): ChangePostBody => {
    return {
        title,
        text
    };
};

export const loginBody = (username: string, password: string): LoginInterface => {
    return {
        username,
        password
    };
};

export const logoutBody = (accessToken: string, refreshToken: string): LogoutInterface => {
    return {
        access_token: accessToken,
        refresh_token: refreshToken
    };
};

export const registerBody = (username: string, email: string, password: string): RegisterBody => {
    return {
        username: username,
        email: email,
        password: password
    };
};

export const changePasswordBody = (oldPassword: string, newPassword: string): ChangePasswordBody => {
    return {
        old_password: oldPassword,
        new_password: newPassword
    };
};

export const  passwordRecoveryBody = (newPassword: string, newPasswordConfirm: string): PasswordRecoveryBody => {
    return {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm
    };
};

export const recoverPasswordBody = (newPassword: string, newPasswordConfirm: string): RecoverPasswordBody => {
    return {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm
    };
};

export const changeUsernameBody = (newUsername: string): ChangeUsernameBody => {
    return {
        new_username: newUsername
    };
};

export const createDialogueBody = (message: string, otherParticipantId: string): CreateDialogueBody => {
    return {
        message,
        other_participant_id: otherParticipantId
    };
};

export const createGroupBody = (otherParticipantsIds: string[]): CreateGroupBody => {
    return {
        other_participants_ids: otherParticipantsIds
    };
};

export const confirmSecondFactorBody = (confirmationCode: string, email: string): ConfirmSecondFactorBody => {
    return {
        email: email,
        confirmation_code: confirmationCode
    };
};

export const emailProvidedBody = (email: string): EmailProvidedBody => {
    return {
        email: email
    };
};
