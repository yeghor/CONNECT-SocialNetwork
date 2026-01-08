import {
    fetchHelper,
    APIResponse
} from "./fetchUtils.ts"

import {
    createWebSocketURL,
    approveChatURL,
    chatConnectURL,
    chatsURL,
    notApprovedChatsURL,
    dialogueChatURL, chatMessages,
    getDialoqueId
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
    MessagesResponse,
    singleMessageResponseMapper,
    SuccessfulResponse,
    successfulResponseMapper, messagesResponseMapper,
    booleanResponseMapper, StringResponse
} from "./responseDTOs.ts"

export class WebsocketNotReady extends Error {
    constructor (msg: string){
        super(msg)
    }
}

export class WebsocketConnectionError extends Error {
    constructor (msg: string){
        super(msg)
    }
}

/**
 * 
 * @param {WebSocket} ws - takes websocket object
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


// Websockets
type ChatAction = "send" | "change" | "delete";
const wsClosedErrorMessage = "WebSocket connection is closed"


const wsDataMapper = (action: ChatAction, message?: string, messageId?: string, tempId?: string): string => {
    return JSON.stringify({
        action: action,
        message: message ?? null,
        message_id: messageId ?? null,
        temp_id: tempId ?? null
    });
}

export const connectWSChat = (token: string): WebSocket => {
    return new WebSocket(createWebSocketURL(token));
}

const websocketMessageHelper = (ws: WebSocket, action: ChatAction, message?: string, messageId?: string, tempId?: string): void => {
    try {
        let wsData: string;

        switch (action) {
            case "send":
                wsData = wsDataMapper(action, message, undefined, tempId);
                break;
            case "change":
                wsData = wsDataMapper(action, message, messageId, undefined);
                break;
            case "delete":
                wsData = wsDataMapper(action, undefined, messageId, undefined);
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
};

export const sendMessage = (ws: WebSocket, message: string, tempId: string): void => {
    websocketMessageHelper(ws, "send", message, undefined, tempId);
};

export const changeMessage = (ws: WebSocket, message: string, messageId: string): void => {
    websocketMessageHelper(ws, "change", message, messageId, undefined);
};

export const deleteMessage = (ws: WebSocket, messageId: string): void => {
    websocketMessageHelper(ws, "delete", undefined, messageId, undefined);
};


export const fetchChatConnect = async (accessJWT: string, chatId: string): APIResponse<ChatConnectResponse> => {
    const requestIinit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper(chatConnectURL(chatId), requestIinit, chatConnectMapper);
};

export const fetchChatMessagesBatch = async (accessJWT: string, chatId: string, page: number): APIResponse<MessagesResponse> => {
    const requestIinit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper(chatMessages(chatId, page), requestIinit, messagesResponseMapper);
};

export const fetchDisapproveChat = async (accessJWT: string, chatId: string): APIResponse<SuccessfulResponse> => {
    // TODO
    return successfulResponseMapper();
};

export const fetchApproveChat = async (accessJWT: string, chatId: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<SuccessfulResponse>(approveChatURL(chatId), requestInit, successfulResponseMapper);
};

export const fetchNotApprovedChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(notApprovedChatsURL(page), requestInit, successfulResponseMapper);
};

export const fetchChats = async (accessJWT: string, page: number): APIResponse<ChatsResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT)
    };

    return await fetchHelper<ChatsResponse>(chatsURL(page), requestInit, chatResponseMapper);
};

export const fetchCreateDialogueChat = async (accessJWT: string, participantId: string, message: string): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createDialogueBody(message, participantId))
    };

    return await fetchHelper(dialogueChatURL, requestInit, successfulResponseMapper);
};

export const fetchCreateGroupChat = async (accessJWT: string, participantsIds: string[]): APIResponse<SuccessfulResponse> => {
    const requestInit: RequestInit = {
        method: "POST",
        headers: requestTokenHeaders(accessJWT),
        body: JSON.stringify(createGroupBody(participantsIds))
    };

    return await fetchHelper(dialogueChatURL, requestInit, successfulResponseMapper);
};

export const fetchDialoqueId = async (accessJWT: string, otherUserId: string): APIResponse<StringResponse> => {
    const requestInit: RequestInit = {
        method: "GET",
        headers: requestTokenHeaders(accessJWT),
    };

    return await fetchHelper(getDialoqueId(otherUserId), requestInit, booleanResponseMapper);
};
