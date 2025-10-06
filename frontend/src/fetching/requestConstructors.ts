interface BaseHeaderType {
    [key: string]: string
};

type TokenHeaderType = BaseHeaderType & {
    [key: string]: string;
};;


export const requestHeaders = (): BaseHeaderType => {
    return {
        "Content-Type": "application/json",
    };
}

export const requestTokenHeaders = (JWT: string): TokenHeaderType => {
    return {
        "Content-Type": "application/json",
        "token": JWT
    };
}

// For files
export const requestTokenMultipartHeaders = (JWT: string): TokenHeaderType => {
    return {
        "Content-Type": "multipart/form-data",
        "token": JWT
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
    old_password: string,
    new_password: string
};

interface ChangeUsernameInterface {
    new_username: string
};

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

export const registerBody = (username: string, password: string, email: string): RegisterInterface => {
    return {
        username,
        password,
        email
    };
}

export const changePasswordBody = (oldPassword: string, newPassword: string): ChangePasswordInterface => {
    return {
        old_password: oldPassword,
        new_password: newPassword
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
