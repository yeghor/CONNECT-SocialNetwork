export interface SuccessfulResponse {
    success: true
}
export const successfulResponseMapper = (): SuccessfulResponse => {
    return {
        success: true
    };
}

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
}

export const badResponseMapper = (data: BadResponseDTO, statusCode: number): BadResponse => {
    return {
        detail: data.detail,
        statusCode: statusCode,
        success: false
    };
}

const OwnerMapper = (data: OwnerDTO): OwnerResponse => {
    return {
        userId: data.user_id,
        username: data.username,
    };
}

// Login/Register/Refresh

export interface AccessTokenDTO {
    access_token: string,
    expires_at_access: string,
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
}
// Posts

interface OwnerDTO {
    user_id: string;
    username: string;
}

interface ShortPostDTO {
    post_id: string;
    title: string;
    published: string;
    is_reply: boolean;
    owner: OwnerDTO;
    likes: number,
    views: number,
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

export interface OwnerResponse {
    userId: string,
    username: string
}

export interface ShortPostInterface {
    postId: string;
    title: string;
    published: Date;
    isReply: boolean;
    owner: OwnerResponse;
    likes: number,
    views: number,
    replies: number,
    picturesURLs: string[]
}

export interface FeedPostResponse extends ShortPostInterface {
    parentPost?: ShortPostInterface
}

export interface LoadPostResponseInterface extends FeedPostResponse {
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
    data: FeedPostResponse[]
}

// KISS THIS MOTHERFUCKER
export const loadPostResponseMapper = (postDTO: LoadPostResponseDTO): LoadPostResponse => {
    const mapped =
        {
            postId: postDTO.post_id,
            title: postDTO.title,
            published: new Date(postDTO.published),
            isReply: postDTO.is_reply,
            owner: OwnerMapper(postDTO.owner),
            likes: postDTO.likes,
            views: postDTO.views,
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
                    owner: OwnerMapper(postDTO.parent_post.owner),
                    likes: postDTO.parent_post.likes,
                    views: postDTO.parent_post.views,
                    replies: postDTO.parent_post.replies,
                    picturesURLs: postDTO.parent_post.pictures_urls,
                }
                : undefined,
        }

    return {
        data: mapped,
        success: true
    }
}

export const feedPostResponseMapper = (data: FeedPostsResponseDTO): FeedPostsResponse => {
    const mapped = data.map(postDTO => ({
    postId: postDTO.post_id,
    title: postDTO.title,
    published: new Date(postDTO.published),
    isReply: postDTO.is_reply,
    owner: OwnerMapper(postDTO.owner),
    likes: postDTO.likes,
    views: postDTO.views,
    replies: postDTO.replies,
    picturesURLs: postDTO.pictures_urls,
    parentPost: postDTO.parent_post
        ? {
            postId: postDTO.parent_post.post_id,
            title: postDTO.parent_post.title,
            published: new Date(postDTO.parent_post.published),
            isReply: postDTO.parent_post.is_reply,
            owner: OwnerMapper(postDTO.parent_post.owner),
            likes: postDTO.parent_post.likes,
            views: postDTO.parent_post.views,
            replies: postDTO.parent_post.replies,
            picturesURLs: postDTO.parent_post.pictures_urls,
        }
        : undefined,
    }));    

    return {
        data: mapped,
        success: true
    }
}

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
            replies: commentDTO.replies,
            owner: OwnerMapper(commentDTO.owner),
            picturesURLs: commentDTO.pictures_urls
        }
    ));

    return {
        data: mapped,
        success: true
    }
}


// User profiles
interface ShortUserDTO {
    user_id: string,
    username: string,
    followers: number
}

export type ShortUsersDTOResponse = ShortUserDTO[];

export interface UserProfileDTO extends ShortUserDTO {
  followed: number,
  avatar_url: string
}

interface ShortUserProfile {
    userId: string,
    username: string,
    followers: number
}

export interface ShortUserProfilesResponse extends SuccessfulResponse{
    data: ShortUserProfile[],
}

export interface UserProfileResponse extends ShortUserProfile, SuccessfulResponse {
    followed: number,
    avatarURL: string,
}

export const userShortProfilesMapper = (data: ShortUsersDTOResponse): ShortUserProfilesResponse => {
    const mapped = data.map((shortUserDTO) =>
        ({
            userId: shortUserDTO.user_id,
            username: shortUserDTO.username,
            followers: shortUserDTO.followers
        })
    )
    return {
        data: mapped,
        success: true
    };
}

export const userProfileMapper = (data: UserProfileDTO): UserProfileResponse => {
    return {
        userId: data.user_id,
        username: data.username,
        followers: data.followers,
        followed: data.followed,
        avatarURL: data.avatar_url,
        success: true
    };
}

// Chat
export interface ChatDTO {
    chat_id: string,
    participants: number
}

type ChatsDTO = ChatDTO[];

interface ChatResponse {
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
}

export interface MessageDTO {
    message_id: string,
    text: string,
    sent: string,
    owner: OwnerDTO
}

export type MessagesDTO = MessageDTO[]

export interface MessageInterface {
    messageId: string,
    text: string,
    sent: Date,
    owner: OwnerResponse
}

export interface MessagesResponse extends SuccessfulResponse {
    data: MessageInterface[]
}

export interface MessageResponse extends SuccessfulResponse {
    data: MessageInterface
}

// DRY THIS
export const messagesResponseMapper = (data: MessagesDTO): MessagesResponse => {
    const mapped = data.map((messageDTO) => ({
        messageId: messageDTO.message_id,
        text: messageDTO.text,
        sent: new Date(messageDTO.sent),
        owner: OwnerMapper(messageDTO.owner)
    }));

    return {
        data: mapped,
        success: true
    };
    
};

export const singleMessageResponseMapper = (data: MessageDTO): MessageResponse => {
    return {
        data: {
            messageId: data.message_id,
            text: data.text,
            sent: new Date(data.sent),
            owner: OwnerMapper(data.owner),  
        },
        success: true
    };
}   

// Chat access
export interface ChatConnectDTO {
    token: string,
    participants_avatar_urls: string[]
}

export interface ChatConnectResponse extends SuccessfulResponse {
    token: string,
    participantsAvatarURLs: string[]
}

export const chatConnectMapper = (data: ChatConnectDTO): ChatConnectResponse => {
    return {
        token: data.token,
        participantsAvatarURLs: data.participants_avatar_urls,
        success: true
    };
}