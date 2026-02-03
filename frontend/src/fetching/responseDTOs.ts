export interface SuccessfulResponse {
    success: true
}
export const successfulResponseMapper = (): SuccessfulResponse => {
    return {
        success: true
    };
};

interface NotSuccessfulResponse {
    success: false
}

interface BadResponseDTO extends NotSuccessfulResponse {
    detail: string
}

export interface BadResponse extends BadResponseDTO, NotSuccessfulResponse {
    statusCode: number
}

export interface CustomSimpleResponse<T> extends SuccessfulResponse {
    content: T
}

export const customSimpleResponseMapper = <T>(content: T): CustomSimpleResponse<T> => {
    return {
        success: true,
        content: content
    };
};

export const isBadResponse = (data: any): data is BadResponseDTO => {
    if (typeof data === "object" && data !== null && data !== undefined) {
        return "detail" in data;
    };
    // If response is not object, it ensures that the server returned a successful request
    // Because the backend's bad response always has `detail` property
    return false;
    
};

export const badResponseMapper = (data: BadResponseDTO, statusCode: number): BadResponse => {
    return {
        detail: data.detail,
        statusCode: statusCode,
        success: false
    };
};

export const createBadResponseManually = (detail: string, statusCode: number): BadResponse => {
    return {
        detail: detail,
        statusCode: statusCode,
        success: false
    };
};

// Second Factor


// ====================

const userMapper = (data: UserDTO): User => {

    return {
        userId: data.user_id,
        username: data.username,
        avatarURL: data.avatar_url ?? null
    };
};

// Login/Register/Refresh

export interface AccessTokenDTO {
    access_token: string,
    expires_at_access: string
}

export interface AuthResponseDTO extends AccessTokenDTO {
    refresh_token: string,
    expires_at_refresh: string
}

export interface AccessTokenResponse extends SuccessfulResponse {
    accessToken: string,
    expiresAtAccessToken: Date
}

export interface AuthTokensResponse extends AccessTokenResponse {
    refreshToken: string,
    expiresAtRefreshToken: Date
}

export const authTokensResponseMapper = (data: AuthResponseDTO): AuthTokensResponse => {
    return {
        accessToken: data.access_token,
        expiresAtAccessToken: new Date(data.expires_at_access),
        refreshToken: data.refresh_token,
        expiresAtRefreshToken: new Date(data.expires_at_refresh),
        success: true
    };
};

interface UserDTO {
    user_id: string;
    username: string;
    avatar_url: string | null;
}

export interface User {
    userId: string;
    username: string;
    avatarURL: string | null;
}

// Posts

interface PostBaseDTO {
    post_id: string;
    title: string;
    published: Date;
    is_reply: boolean;
}

interface ShortPostDTO extends PostBaseDTO {
    owner: UserDTO;
    likes: number,
    views: number,
    is_liked: boolean,
    replies: number,
    pictures_urls: string[]
}

interface FeedPostDTO extends ShortPostDTO{
    parent_post?: FeedPostDTO;
}

interface LoadPostResponseDTO extends FeedPostDTO{
    text: string,
    last_updated: string
}

type ShortPostsDTO = ShortPostDTO[];
type FeedPostsResponseDTO = FeedPostDTO[];


interface PostBase {
    postId: string;
    title: string;
    published: Date;
    isReply: boolean;
}

export interface ShortPostInterface extends PostBase {
    owner: User;
    likes: number,
    views: number,
    isLiked: boolean,
    replies: number,
    picturesURLs: string[]
}

export interface FeedPost extends ShortPostInterface {
    parentPost?: ShortPostInterface
}

export interface LoadPostResponseInterface extends FeedPost {
    text: string,
    lastUpdated: Date
}

export interface LoadPostResponse extends SuccessfulResponse {
    data: LoadPostResponseInterface
}
export interface PostCommentsResponse extends SuccessfulResponse {
    data: ShortPostInterface[]
}
export interface FeedPostsResponse extends SuccessfulResponse {
    data: FeedPost[]
}

export interface PostBaseResponse extends SuccessfulResponse {
    data: PostBase
}

export const postBaseMapper = (postBaseDTO: PostBaseDTO): PostBaseResponse => {
    return {
        data: {
            postId: postBaseDTO.post_id,
            title: postBaseDTO.title,
            published: new Date(postBaseDTO.published),
            isReply: postBaseDTO.is_reply
        },
        success: true
    };
};

// KISS THIS MOTHERFUCKER
export const loadPostResponseMapper = (postDTO: LoadPostResponseDTO): LoadPostResponse => {
    const mapped =
        {
            postId: postDTO.post_id,
            title: postDTO.title,
            published: new Date(postDTO.published),
            isReply: postDTO.is_reply,
            owner: userMapper(postDTO.owner),
            likes: postDTO.likes,
            views: postDTO.views,
            isLiked: postDTO.is_liked,
            replies: postDTO.replies,
            text: postDTO.text,
            lastUpdated: new Date(postDTO.last_updated),
            picturesURLs: postDTO.pictures_urls,
            parentPost: postDTO.parent_post
                ? {
                    postId: postDTO.parent_post.post_id,
                    title: postDTO.parent_post.title,
                    published: new Date(postDTO.parent_post.published),
                    isReply: postDTO.parent_post.is_reply,
                    owner: userMapper(postDTO.parent_post.owner),
                    likes: postDTO.parent_post.likes,
                    views: postDTO.parent_post.views,
                    isLiked: postDTO.parent_post.is_liked,
                    replies: postDTO.parent_post.replies,
                    picturesURLs: postDTO.parent_post.pictures_urls,
                }
                : undefined,
        };

    return {
        data: mapped,
        success: true
    };
};

export const feedPostResponseMapper = (data: FeedPostsResponseDTO): FeedPostsResponse => {
    const mapped = data.map(postDTO => ({
    postId: postDTO.post_id,
    title: postDTO.title,
    published: new Date(postDTO.published),
    isReply: postDTO.is_reply,
    owner: userMapper(postDTO.owner),
    likes: postDTO.likes,
    views: postDTO.views,
    isLiked: postDTO.is_liked,
    replies: postDTO.replies,
    picturesURLs: postDTO.pictures_urls,
    parentPost: postDTO.parent_post
        ? {
            postId: postDTO.parent_post.post_id,
            title: postDTO.parent_post.title,
            published: new Date(postDTO.parent_post.published),
            isReply: postDTO.parent_post.is_reply,
            owner: userMapper(postDTO.parent_post.owner),
            likes: postDTO.parent_post.likes,
            views: postDTO.parent_post.views,
            isLiked: postDTO.parent_post.is_liked,
            replies: postDTO.parent_post.replies,
            picturesURLs: postDTO.parent_post.pictures_urls,
        }
        : undefined,
    }));    

    return {
        data: mapped,
        success: true
    };
};

// Comments
export const postCommentsResponseMapper = (data: ShortPostsDTO): PostCommentsResponse => {
    const mapped = data.map((commentDTO) => (
        {
            postId: commentDTO.post_id,
            title: commentDTO.title,
            published: new Date(commentDTO.published),
            isReply: commentDTO.is_reply,
            likes: commentDTO.likes,
            views: commentDTO.views,
            isLiked: commentDTO.is_liked,
            replies: commentDTO.replies,
            owner: userMapper(commentDTO.owner),
            picturesURLs: commentDTO.pictures_urls
        }
    ));

    return {
        data: mapped,
        success: true
    };
};


// User profiles
interface ShortUserDTO extends UserDTO {
    followers: number,
    joined: string
}

export type ShortUsersDTOResponse = ShortUserDTO[];

export interface UserProfileDTO extends ShortUserDTO {
    followed: number,
    me: boolean,
    is_following: boolean
}

export interface ShortUserProfile extends User {
    followers: number,
    joined: Date
}

export interface UserProfile extends ShortUserProfile {
    followed: number,
    me: boolean,
    isFollowing: boolean
}

export interface UserProfileResponse extends SuccessfulResponse {
    data: UserProfile,
    success: true
}

export interface ShortUserProfilesResponse extends SuccessfulResponse{
    data: ShortUserProfile[],
}

export const shortUserProfilesMapper = (data: ShortUsersDTOResponse): ShortUserProfilesResponse => {
    const mapped = data.map((shortUserDTO) =>
        ({
            userId: shortUserDTO.user_id,
            username: shortUserDTO.username,
            avatarURL: shortUserDTO.avatar_url,
            followers: shortUserDTO.followers,
            joined: new Date(shortUserDTO.joined)
        })
    );
    return {
        data: mapped,
        success: true
    };
};

export const userProfileMapper = (data: UserProfileDTO): UserProfileResponse => {
    return {
        data: {
            userId: data.user_id,
            username: data.username,
            followers: data.followers,
            followed: data.followed,
            avatarURL: data.avatar_url,
            joined: new Date(data.joined),
            me: data.me,
            isFollowing: data.is_following,
        },
        success: true
    };
};

export type RecentActivityType = "post" | "like" | "reply"

interface RecentActivityBase {
    type: RecentActivityType,
    message: string,
    postId: string
    date: Date
}

interface RecentActivityBaseDTO extends RecentActivityBase {
    avatar_url: string | undefined
}

type RecentActivityDTO = RecentActivityBaseDTO[];

export interface RecentActivity extends RecentActivityBase {
    avatarURL: string | undefined
}

export type RecentActivityArray = RecentActivity[];

export interface RecentActivityResponse extends SuccessfulResponse {
    data: RecentActivityArray;
}

export const recentActivityMapper = (data: RecentActivityDTO): RecentActivityResponse => {
    const mapped = data.map((DTO) => {
        return {
            type: DTO.type,
            message: DTO.message,
            date: new Date(DTO.date),
            postId: DTO.postId,
            avatarURL: DTO.avatar_url
        };
    });

    return {
        data: mapped,
        success: true
    };
};

// Chat
export interface ChatDTO {
    chat_id: string,
    chat_name: string,
    participants_count: number,
    chat_image_url: string | null
    last_message: ChatMessageDTO | null
}

type ChatsDTO = ChatDTO[];

export interface Chat {
    chatId: string,
    chatName: string,
    participantsCount: number,
    chatImageURL: string | null 
    lastMessage: ChatMessage | null
}

export interface ChatsResponse extends SuccessfulResponse{
    data: Chat[],
}

export const chatResponseMapper = (data: ChatsDTO): ChatsResponse => {
    const mapped = data.map((chatDTO) => (
        {
            chatId: chatDTO.chat_id,
            chatName: chatDTO.chat_name,
            participantsCount: chatDTO.participants_count,
            chatImageURL: chatDTO.chat_image_url,
            lastMessage: chatDTO.last_message ? mapSingleMessage(
                chatDTO.last_message.message_id,
                chatDTO.last_message.text,
                new Date(chatDTO.last_message.sent),
                userMapper(chatDTO.last_message.owner),
                chatDTO.last_message.me,
                chatDTO.last_message.temp_id
            ) : null
        }
    ));

    return {
        data: mapped,
        success: true
    };
};

interface MessageTextRequired {
    text: string
}

interface MessageTextNotRequired {
    text: string | null
}

interface SendAction {
    action: "send"
}

interface ChangeDeleteAction {
    action: "change" | "delete"
}

interface ShortChatMessageBaseDTO {
    message_id: string,
    text: string | null
}

interface ShortChatMessageBase {
    messageId: string,
    text: string | null
}

interface ChatMessageBaseDTO {
    message_id: string,
    sent: string,
    owner: UserDTO,
    me: boolean,

    // Frontend given ID that backend returns on websocket distribution - see ReadMe-dev.md
    temp_id: string | null
}

interface ChatMessageBase {
    messageId: string,
    sent: Date,
    owner: User,
    me: boolean,

    // See explanation in ChatMessageDTO
    tempId: string | null
}

export interface ChatMessageDTO extends ChatMessageBaseDTO, MessageTextRequired {}
export type ChatMessagesDTO = ChatMessageDTO[]

export interface ChatMessage extends ChatMessageBase, MessageTextRequired {}

export interface MessagesResponse extends SuccessfulResponse {
    data: ChatMessage[]
}

interface SendWebsocketReceivedMessageSchemaDTO extends ChatMessageBaseDTO, MessageTextRequired, SendAction {}
export interface ChangeDeleteWebsocketReceivedMessageDTO extends ShortChatMessageBaseDTO, ChangeDeleteAction {}
export interface SendWebsocketReceivedMessage extends ChatMessageBase, MessageTextRequired, SendAction {}
export interface ChangeDeleteWebsocketReceivedMessage extends ShortChatMessageBase, ChangeDeleteAction {}

export const mapWebsocketReceivedMessage = (data: SendWebsocketReceivedMessageSchemaDTO | ChangeDeleteWebsocketReceivedMessageDTO): SendWebsocketReceivedMessage | ChangeDeleteWebsocketReceivedMessage  => {
    const shortResponse = {
        action: data.action,
        messageId: data.message_id,
        text: data.text,
    };
    if (data.action === "send") {
        const sendResponsePart = {
            sent: new Date(data.sent),
            owner: userMapper(data.owner),
            tempId: data.temp_id ?? null
        }
        // @ts-ignore
        return { ...shortResponse, ...sendResponsePart };
    }
    // @ts-ignore
    return shortResponse

    /*
    * The TypeScript ignore is **temporar**, use owner and sent attributes only if action="send".
    */
};

export const messagesResponseMapper = (data: ChatMessagesDTO): MessagesResponse => {
    const mapped = data.map((messageDTO) => ({
        messageId: messageDTO.message_id,
        text: messageDTO.text,
        sent: new Date(messageDTO.sent),
        owner: userMapper(messageDTO.owner),
        me: messageDTO.me,
        tempId: messageDTO.temp_id ?? null
    }));

    return {
        data: mapped,
        success: true
    };
    
};

export const singleMessageResponseMapper = (data: ChatMessageDTO): ChatMessage => {
    return {
        messageId: data.message_id,
        text: data.text,
        sent: new Date(data.sent),
        owner: userMapper(data.owner),
        me: data.me,
        tempId: data.temp_id ?? null
    };
};

export const mapSingleMessage = (messageId: string, text: string, sent: Date, owner: User, me: boolean, tempId: string | null): ChatMessage => {
    return { messageId, text, sent, owner, me, tempId }
}

interface ChatParticipantDTO extends UserDTO {
    me: boolean;
}
export interface ChatParticipant extends User {
    me: boolean;
}

// Chat access
interface ChatConnectDTO {
    token: string,
    participants_data: ChatParticipantDTO[]
    chat_id: string
    is_group: boolean
}

export interface ChatConnectData {
    token: string,
    participantsData: ChatParticipant[],
    chatId: string,
    isGroup: boolean
}

export interface ChatConnectResponse extends SuccessfulResponse {
    data: ChatConnectData
}

const chatUserMapper = (chatUser: ChatParticipantDTO): ChatParticipant => {
    return {
        userId: chatUser.user_id,
        username: chatUser.username,
        avatarURL: chatUser.avatar_url,
        me: chatUser.me
    };
};

export const chatConnectMapper = (data: ChatConnectDTO): ChatConnectResponse => {
    const mappedParticipantsData = data.participants_data.map((userDTO) => {
        return chatUserMapper(userDTO);
    });

    return {
        data: {
            token: data.token,
            chatId: data.chat_id,
            participantsData: mappedParticipantsData,
            isGroup: data.is_group
        },
        success: true
    };
};

interface PendingChatConnectDTO {
    message: ChatMessageDTO,
    initiator_user: ChatParticipantDTO,
    initiated_by_me: boolean
}

export interface PendingChatConnect {
    message: ChatMessage,
    initiatorUser: ChatParticipant,
    initiatedByMe: boolean
}

export interface PendingChatConnectResponse extends SuccessfulResponse {
    data: PendingChatConnect
}

export const pendingChatConnectResponseMapper = (data: PendingChatConnectDTO): PendingChatConnectResponse => {
    return {
        data: {
            message: singleMessageResponseMapper(data.message),
            initiatorUser: chatUserMapper(data.initiator_user),
            initiatedByMe: data.initiated_by_me
        },
        success: true
    }
}