import {
    fetchHelper,
    APIResponse
} from "./fetchUtils.ts"

import { 
    WebSocketURL,
    approveChatURL,
    chatConnectURL,
    chatURL,
    ChatsURL,
    BatchChatMessagesURL,
    notApprovedChatsURL,
    dialoqueChatURL,
} from "./urls.ts"

import {
    requestHeaders,
    requestTokenHeaders,
    createDialogueBody,
    createGroupBody
} from "./requestConstructors.ts"

import { 
    ChatConnectResponse,
    chatConnectMapper,
    ChatsResponse,
    chatResponseMapper,
    MessageResponse,
    MessagesResponse,
    singleMessageResponseMapper,
    SuccessfullResponse,
    successfullResponseMapper,
} from "./responseDTOs.ts"

export const checkWSConnEstablished = (ws: WebSocket): boolean => {
    if (ws.readyState == 1) {
        return false;
    } else if (ws.readyState == 3 || ws.readyState == 2) {
        return false;
    } else {
        console.warn("Connection establishing...");
        return false;
    }
}

// Webosckets
type chatAction = "send" | "change" | "delete";
const wsClosedErrorMessage = "WebSocket connection is closed"


interface ExpectedWSData {
    action: chatAction,

    message: string | null,
    messageId: string | null
};

const wsDataMapper = (action: chatAction, message: string | null = null, messageId: string | null = null): string => {
    return JSON.stringify({
        action: action,
        message: message,
        messageId: messageId
    });
}

export const connectWSChat = (): WebSocket => {
    return new WebSocket(WebSocketURL);
}

export const sendMessage = (ws: WebSocket, message: string): void => {
    if (checkWSConnEstablished(ws)) {
        const wsData = wsDataMapper("send", message);
        ws.send(wsData)
    } else {
        throw new Error(wsClosedErrorMessage);
    }
}

export const changeMessage = (ws: WebSocket, messageId: string): void => {
    if (checkWSConnEstablished(ws)) {
        const wsData = wsDataMapper("change", messageId);
        ws.send(wsData);
    } else {
        throw new Error(wsClosedErrorMessage);
    }
}

export const deleteMessage = (ws: WebSocket, messageId: string): void => {
    if (checkWSConnEstablished(ws)) {
        const wsData = wsDataMapper("delete", messageId);
        ws.send(wsData)
    } else {
        throw new Error(wsClosedErrorMessage);
    }
}


// API Calls
export const fetchApproveChat = async (accessJWT: string, chatId: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfullResponse>(approveChatURL(chatId), requestInit, successfullResponseMapper);
}

export const fetchNotApprovedChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(notApprovedChatsURL(page), requestInit, successfullResponseMapper);
}

export const fetchAllChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(ChatsURL(page), requestInit, successfullResponseMapper);
}

export const fetchCreateDialogueChat = async (accessJWT: string, participantId: string, message: string): APIResponse<SuccessfullResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createDialogueBody(message, participantId))
    };

    return await fetchHelper(dialoqueChatURL, requestInit, successfullResponseMapper);
}

export const fetchCreateGroupChat = async (accessJWT: string, participantsIds: string[]) => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createGroupBody(participantsIds))
    };

    return await fetchHelper(dialoqueChatURL, requestInit, successfullResponseMapper);
}
