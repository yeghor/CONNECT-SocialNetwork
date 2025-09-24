// Login/Register/Refresh

interface AccesTokenDTO {
    acces_token: string,
    expires_at_acces: string,
};

interface AuthResponseDTO extends AccesTokenDTO {
    refresh_token: string,
    expires_at_refresh: string
};

export interface AccesTokenResponse {
    accessToken: string,
    expiresAtAccessToken: string
};

export interface AuthTokensResponse extends AccesTokenResponse {
    refreshToken: string,
    expiresAtRefreshToken: string
};

export const authTokensResponseMapper = (data: AuthResponseDTO): AuthTokensResponse => {
    return {
        accessToken: data.acces_token,
        expiresAtAccessToken: data.expires_at_acces,
        refreshToken: data.refresh_token,
        expiresAtRefreshToken: data.expires_at_refresh
    };
}

export const accesTokenResponseMapper = (data: AccesTokenDTO): AccesTokenResponse => {
    return {
        accessToken: data.acces_token,
        expiresAtAccessToken: data.expires_at_acces
    };
}

// Posts

interface PostOwnerDTO {
    user_id: string;
    username: string;
};

interface ShortPostDTO {
    post_id: string;
    title: string;
    published: string;
    is_reply: boolean;
    owner: PostOwnerDTO;
    likes: number,
    views: number,
    replies: number,
    pictures_urls: string[]
};

interface PostDTO extends ShortPostDTO{
    parent_post?: PostDTO;
};

type ShortPostsDTO = ShortPostDTO[];
type PostsResponseDTO = PostDTO[];

interface PostOwner {
    userId: string,
    username: string
};

interface ShortPostReponse {
    postId: string;
    title: string;
    published: string;
    isReply: boolean;
    owner: PostOwner;
    likes: number,
    views: number,
    replies: number,
    picturesURLs: string[]
};

interface PostResponse extends ShortPostReponse{
    parentPost?: ShortPostReponse
};

type PostCommentsResponse = ShortPostReponse[];
type PostsResponse = PostResponse[];

export const postResponseMapper = (data: PostsResponseDTO): PostsResponse => {
    const mapped = data.map(postDTO => ({
    postId: postDTO.post_id,
    title: postDTO.title,
    published: postDTO.published,
    isReply: postDTO.is_reply,
    owner: {
        userId: postDTO.owner.user_id,
        username: postDTO.owner.username,
    },
    likes: postDTO.likes,
    views: postDTO.views,
    replies: postDTO.replies,
    picturesURLs: postDTO.pictures_urls,
    parentPost: postDTO.parent_post
        ? {
            postId: postDTO.parent_post.post_id,
            title: postDTO.parent_post.title,
            published: postDTO.parent_post.published,
            isReply: postDTO.parent_post.is_reply,
            owner: {
                userId: postDTO.parent_post.owner.user_id,
                username: postDTO.parent_post.owner.username,
            },
            likes: postDTO.likes,
            views: postDTO.views,
            replies: postDTO.replies,
            picturesURLs: postDTO.parent_post.pictures_urls,
        }
        : undefined,
    }));    

    return mapped
}

// Comments

export const postCommentsResponseMapper = (data: ShortPostsDTO): PostCommentsResponse => {
    const mapped = data.map((commentDTO) => (
        {
            postId: commentDTO.post_id,
            title: commentDTO.title,
            published: commentDTO.published,
            isReply: commentDTO.is_reply,
            likes: commentDTO.likes,
            views: commentDTO.views,
            replies: commentDTO.replies,
            owner: {
                userId: commentDTO.owner.user_id,
                username: commentDTO.owner.username
            },
            picturesURLs: commentDTO.pictures_urls
        }
    ));

    return mapped;
}


// User profiles

interface ShortUserDTO {
    user_id: string,
    username: string,
    followers: number
};

export type ShortUsersDTOResponse = ShortUserDTO[];

export interface UseProfilerDTO extends ShortUserDTO {
  followed: number,
  avatar_url: string
};

interface ShortUserProfile {
    userId: string,
    username: string,
    followers: number
};

export type ShortUserProfilesResponse = ShortUserProfile[];

interface UserProfile extends ShortUserProfile {
    followed: number,
    avatarURL: string
};

export const userShortProfilesMapper = (data: ShortUsersDTOResponse): ShortUserProfilesResponse => {
    const mapped = data.map((shortUserDTO) =>
        ({
            userId: shortUserDTO.user_id,
            username: shortUserDTO.username,
            followers: shortUserDTO.followers
        })
    )
    return mapped;
}

export const userProfileMapper = (data: UseProfilerDTO): UserProfile => {
    return {
        userId: data.user_id,
        username: data.username,
        followers: data.followers,
        followed: data.followed,
        avatarURL: data.avatar_url
    };
}

//