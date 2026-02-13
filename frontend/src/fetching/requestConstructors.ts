interface BaseHeaderType {
    [key: string]: string
}

type TokenHeaderType = BaseHeaderType & {
    [key: string]: string;
}

const createBearerToken = (token: string) => `Bearer ${token}`;

export const requestHeaders = (): BaseHeaderType => {
    return {
        "Content-Type": "application/json",
    };
}

export const requestTokenHeaders = (JWT: string): TokenHeaderType => {
    return {
        "Content-Type": "application/json",
        "token": createBearerToken(JWT)
    };
}

// For files
export const requestTokenMultipartHeaders = (JWT: string): TokenHeaderType => {
    return {
        // https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
        // Not setting Content-type to prevent - Missing boundary in multipart/form-data from the backend
        //@ts-ignore
        "token": createBearerToken(JWT)
    };
}


interface LoginInterface {
    password: string
    username: string
};

interface RegisterInterface extends LoginInterface {
    email: string
};

interface LogoutInterface {
    access_token: string,
    refresh_token: string
};

interface ChangePostInterface {
    title: string
    text: string
};

interface MakePostInterface extends ChangePostInterface {
    parent_post_id: string | null
};

interface ChangePasswordInterface {
    new_password: string,
    new_password_confirm: string
};

interface ChangeUsernameInterface {
    new_username: string
};

interface EmailToConfirmInterface {
    email_to_confirm: string
}

interface ConfirmSecondFactorInterface extends EmailToConfirmInterface {
    confirmation_code: string
}

interface CreateChatInterface { 
    message: string,
};

interface CreateDialogueInterface extends CreateChatInterface {
    other_participant_id: string
};

interface CreateGroupInterface {
    other_participants_ids: string[]
};

export const makePostBody = (title: string, text: string, parentPostId: string | null): MakePostInterface => {
    return {
        title,
        text,
        parent_post_id: parentPostId
    };
}

export const changePostBody = (title: string, text: string): ChangePostInterface => {
    return {
        title,
        text
    };
}

export const loginBody = (username: string, password: string): LoginInterface => {
    return {
        username,
        password
    };
}

export const logoutBody = (accessToken: string, refreshToken: string): LogoutInterface => {
    return {
        access_token: accessToken,
        refresh_token: refreshToken
    };
}

export const registerBody = (username: string, email: string, password: string): RegisterInterface => {
    return {
        username: username,
        email: email,
        password: password
    };
}

export const changePasswordBody = (newPassword: string, newPasswordConfirm: string): ChangePasswordInterface => {
    return {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm
    };
}

export const changeUsernameBody = (newUsername: string): ChangeUsernameInterface => {
    return {
        new_username: newUsername
    };
}

export const createDialogueBody = (message: string, otherParticipantId: string): CreateDialogueInterface => {
    return {
        message,
        other_participant_id: otherParticipantId
    };
}

export const createGroupBody = (otherParticipantsIds: string[]): CreateGroupInterface => {
    return {
        other_participants_ids: otherParticipantsIds
    };
}

export const confirmSecondFactorBody = (confirmationCode: string, email: string): ConfirmSecondFactorInterface => {
    return {
        email_to_confirm: email,
        confirmation_code: confirmationCode
    };
};

export const issueNewSecondFactorBody = (emailToConfirm: string) => {
    return {
        emailToConfirm: emailToConfirm
    };
};
