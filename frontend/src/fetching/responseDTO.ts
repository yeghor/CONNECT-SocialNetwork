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
    pictures_urls: string[];
};

interface PostDTO extends ShortPostDTO{
    parent_post?: PostDTO;
};

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
    picturesURLs: string[];
}

interface PostResponse extends ShortPostReponse{
    parentPost?: ShortPostReponse
}

type PostsResponse = PostResponse[];

export const postResponseMapper = (data: PostsResponseDTO): PostsResponse => {
    const posts: PostsResponse = [];

    for(let postDTO of data) {
        posts.push(
            {
                postId: postDTO.post_id,
                title: postDTO.title,
                published: postDTO.published,
                isReply: postDTO.is_reply,
                owner: {
                    userId: postDTO.owner.user_id,
                    username: postDTO.owner.username
                },
                picturesURLs: postDTO.pictures_urls,
                parentPost: postDTO.parent_post ? {
                    postId: postDTO.parent_post.post_id,
                    title: postDTO.parent_post.title,
                    published: postDTO.parent_post.published,
                    isReply: postDTO.parent_post.is_reply,
                    owner: {
                        userId: postDTO.parent_post.owner.user_id,
                        username: postDTO.parent_post.owner.username
                    },
                    picturesURLs: postDTO.parent_post.pictures_urls,
                } : undefined
            }
        )
    }
    return posts
}