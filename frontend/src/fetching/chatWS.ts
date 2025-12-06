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
    SuccessfulResponse,
    successfulResponseMapper,
} from "./responseDTOs.ts"

/**
 * 
 * @param {WebSocket} ws - takes webosocket object
 * @returns {void} Returns null if connections established. Else - raise exceptions `WebsocketNotReady` or `WebsocketConnectionError`
 */
export const checkWSConnEstablished = (ws: WebSocket): void => {
    if (ws.readyState == 1) {
        return;
    } else if (ws.readyState == 3 || ws.readyState == 2) {
        throw new WebsocketConnectionError("WebSocket not connected");
    } else {
        throw new WebsocketNotReady("WebSocket connection establishing...");
    }
}

// Webosckets
type chatAction = "send" | "change" | "delete";
const wsClosedErrorMessage = "WebSocket connection is closed"

class WebsocketNotReady extends Error {
    constructor (msg: string){
        super(msg)
    }
};

class WebsocketConnectionError extends Error {
    constructor (msg: string){
        super(msg)
    }
};


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

const websocketMessageHelper = (ws: WebSocket, action: chatAction, message?: string, messageId?: string): void => {
    try {
        let wsData: string;

        switch (action) {
            case "send":
                wsData = wsDataMapper(action, message);
                break;
            case "change":
                wsData = wsDataMapper(action, message, messageId);
                break;
            case "delete":
                wsData = wsDataMapper(action, messageId);
                break;
            default:
                throw new Error(`Unknown chat action: ${action}`);
        }

        ws.send(wsData);

    } catch (err) {
        if (err instanceof WebsocketNotReady) {
            console.warn("WebSocket connection establishing");
        } else if (err instanceof WebsocketConnectionError) {
            console.error("WebSockets connection is not established");
        }
    }
}

export const sendMessage = (ws: WebSocket, message: string): void => {
    websocketMessageHelper(ws, "send", message);
}

export const changeMessage = (ws: WebSocket, message: string, messageId: string): void => {
    websocketMessageHelper(ws, "change", message, messageId);
}

export const deleteMessage = (ws: WebSocket, messageId: string): void => {
    websocketMessageHelper(ws, "delete", undefined, messageId);
}


export const fetchDisapproveChat = async (accessJWT: string, chatId: string): APIResponse<SuccessfulResponse> => {
    // TOOD
    return successfulResponseMapper()
}

export const fetchApproveChat = async (accessJWT: string, chatId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfulResponse>(approveChatURL(chatId), requestInit, successfulResponseMapper);
}

export const fetchNotApprovedChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(notApprovedChatsURL(page), requestInit, successfulResponseMapper);
}

export const fetchChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(ChatsURL(page), requestInit, successfulResponseMapper);
}

export const fetchCreateDialogueChat = async (accessJWT: string, participantId: string, message: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createDialogueBody(message, participantId))
    };

    return await fetchHelper(dialoqueChatURL, requestInit, successfulResponseMapper);
}

export const fetchCreateGroupChat = async (accessJWT: string, participantsIds: string[]) => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createGroupBody(participantsIds))
    };

    return await fetchHelper(dialoqueChatURL, requestInit, successfulResponseMapper);
}
