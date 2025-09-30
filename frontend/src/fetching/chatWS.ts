import { 
    WebSocketURL,
    approveChatURL,
    chatConnectURL,
    chatURL,
    ChatsURL,
    BatchChatMessagesURL,
    notApprovedChatsURL,
} from "./urls.ts"

import { 
    ChatConnectResponse,
    chatConnectMapper,
    ChatsResponse,
    chatResponseMapper,
    MessageResponse,
    MessagesResponse,
    singleMessageResponseMapper,
} from "./responseDTOs.ts"

// Webosckets
export const connectWSChat = (): WebSocket => {
    return new WebSocket(WebSocketURL);
}

export const disconnectWSChat = (): void => {

}

export const sendMessage = async (): Promise<void> => {
    // Check for connection established
}

export const changeMessage = async (): Promise<void> => {
    // Check for connection established
}

export const deleteMessage = async (): Promise<void> => {
    // Check for connection established
}



// API Calls
export const fetchApproveChat = async () => {

}

export const fetchNotApprovedChats = async () => {

}

export const fetchApprovedChats = async () => {

}

export const fetchAllChats = async () => {

}

export const fetchCreateDialogueChat = async () => {

}

export const fetchCreateGroupChat = async () => {

}
