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
    detail: string,
}

export interface BadResponse extends BadResponseDTO, NotSuccessfulResponse {
    statusCode: number
}

export const isBadResponse = (data: any): data is BadResponseDTO => {
    return "detail" in data;
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

const ownerMapper = (data: OwnerDTO): Owner => {
    return {
        userId: data.user_id,
        username: data.username,
        avatarURL: data.avatar_url
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

interface OwnerDTO {
    user_id: string;
    username: string;
    avatar_url: string | null;
}

export interface Owner {
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
    owner: OwnerDTO;
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
    owner: Owner;
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
            owner: ownerMapper(postDTO.owner),
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
                    owner: ownerMapper(postDTO.parent_post.owner),
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
    owner: ownerMapper(postDTO.owner),
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
            owner: ownerMapper(postDTO.parent_post.owner),
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
            owner: ownerMapper(commentDTO.owner),
            picturesURLs: commentDTO.pictures_urls
        }
    ));

    return {
        data: mapped,
        success: true
    };
};


// User profiles
interface ShortUserDTO extends OwnerDTO {
    followers: number,
    joined: string
}

export type ShortUsersDTOResponse = ShortUserDTO[];

export interface UserProfileDTO extends ShortUserDTO {
    followed: number,
    me: boolean,
    is_following: boolean
}

export interface ShortUserProfile extends Owner {
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

export const userShortProfilesMapper = (data: ShortUsersDTOResponse): ShortUserProfilesResponse => {
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
    participants: number
}

type ChatsDTO = ChatDTO[];

export interface ChatResponse {
    chatId: string,
    participants: number
}

export interface ChatsResponse extends SuccessfulResponse{
    data: ChatResponse[],
}

export const chatResponseMapper = (data: ChatsDTO): ChatsResponse => {
    const mapped = data.map((chatDTO) => (
        {
            chatId: chatDTO.chat_id,
            participants: chatDTO.participants
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
interface ChatAction {
    action: "send" | "change" | "delete"
}
interface ChatMessageBaseDTO {
    message_id: string,
    sent: string,
    owner: OwnerDTO

    // Frontend given ID that backend returns on websocket distribution - see ReadMe-dev.md
    temp_id: string | null
}

interface ChatMessageBase {
    messageId: string,
    sent: Date,
    owner: Owner

    // See explanation in ChatMessageDTO
    tempId: string | null
}

export interface MessageDTO extends ChatMessageBaseDTO, MessageTextRequired {}
export type MessagesDTO = MessageDTO[]

export interface ChatMessage extends ChatMessageBase, MessageTextRequired {}

export interface MessagesResponse extends SuccessfulResponse {
    data: ChatMessage[]
}

interface WebsocketReceivedMessageSchemaDTO extends ChatMessageBaseDTO, MessageTextNotRequired, ChatAction {}
export interface WebsocketReceivedMessage extends ChatMessageBase, MessageTextNotRequired, ChatAction {}

export const mapWebsocketReceivedMessage = (data: WebsocketReceivedMessageSchemaDTO): WebsocketReceivedMessage  => {
    return {
        action: data.action,
        messageId: data.message_id,
        text: data.text,
        sent: new Date(data.sent),
        owner: ownerMapper(data.owner),
        tempId: data.temp_id
    };
};

export const messagesResponseMapper = (data: MessagesDTO): MessagesResponse => {
    const mapped = data.map((messageDTO) => ({
        messageId: messageDTO.message_id,
        text: messageDTO.text,
        sent: new Date(messageDTO.sent),
        owner: ownerMapper(messageDTO.owner),
        tempId: messageDTO.temp_id
    }));

    return {
        data: mapped,
        success: true
    };
    
};

export const singleMessageResponseMapper = (data: MessageDTO): ChatMessage => {
    return {
        messageId: data.message_id,
        text: data.text,
        sent: new Date(data.sent),
        owner: ownerMapper(data.owner),
        tempId: data.temp_id
    };
};

export const mapSingleMessage = (messageId: string, text: string, sent: Date, owner: Owner, tempId: string | null): ChatMessage => {
    return { messageId, text, sent, owner, tempId }
}

// Chat access
export interface ChatConnectDTO {
    token: string,
    participants_avatar_urls: string[]
}

export interface ChatConnectData {
    token: string,
    participantsAvatarURLs: string[]
}

export interface ChatConnectResponse extends SuccessfulResponse {
    data: ChatConnectData
}

export const chatConnectMapper = (data: ChatConnectDTO): ChatConnectResponse => {
    return {
        data: {
            token: data.token,
            participantsAvatarURLs: data.participants_avatar_urls
        },
        success: true
    };
};