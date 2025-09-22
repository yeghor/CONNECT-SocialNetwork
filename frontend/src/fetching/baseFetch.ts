type headerType = {
    "Content-Type": string,
    "token": string
}

const getHeaders = (JWT: string): headerType => {
    return {
        "Content-Type": "application/json",
        "token": JWT
    };
}

const makePostBody = () => {
    return;
}

const changePostBody = () => {
    return;
}

const loginBody = () => {
    return;
}

const registerBody = () => {
    return;
}

const refreshBody = () => {
    return;
}

const changePasswordBody = () => {
    return;
}

const changeUsernameBody = () => {
    return;
}

const createDialogueBody = () => {
    return;
}

const createGroupBody = () => {
    return;
}
