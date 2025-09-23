type HeaderType = {
    "Content-Type": string,
    "token": string
};

interface LoginInterface {
    password: string
    username: string
};

interface RegisterInterface extends LoginInterface {
    email: string
};

interface ChangePostInterface {
    title: string
    text: string
};

interface MakePostInterface extends ChangePostInterface {
    parent_post_id?: string
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
}

interface CreateGroupInterface extends CreateChatInterface {
    other_participants_ids: string[]
}


const getHeaders = (JWT: string): HeaderType => {
    return {
        "Content-Type": "application/json",
        "token": JWT
    };
}

const makePostBody = (title: string, text: string, parent_post_id: string | undefined): MakePostInterface => {
    return {
        title,
        text,
        parent_post_id
    };
}

const changePostBody = (title: string, text: string): ChangePostInterface => {
    return {
        title,
        text
    };
}

const loginBody = (username: string, password: string): LoginInterface => {
    return {
        username,
        password
    };
}

const registerBody = (username: string, password: string, email: string): RegisterInterface => {
    return {
        username,
        password,
        email
    };
}

const changePasswordBody = (oldPassword: string, newPassword: string): ChangePasswordInterface => {
    return {
        old_password: oldPassword,
        new_password: newPassword
    };
}

const changeUsernameBody = (newUsername: string): ChangeUsernameInterface => {
    return {
        new_username: newUsername
    };
}

const createDialogueBody = (message: string, otherParticipantId: string): CreateDialogueInterface => {
    return {
        message,
        other_participant_id: otherParticipantId
    };
}

const createGroupBody = (message: string, otherParticipantsIds: string[]): CreateGroupInterface => {
    return {
        message,
        other_participants_ids: otherParticipantsIds
    };
}
