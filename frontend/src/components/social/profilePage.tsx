import React, {useState, useEffect, useRef} from "react";

import VirtualizedList from "../butterySmoothScroll/virtualizedList.tsx";
import FlowPost from "./post/flowPost.tsx";

import { SuccessfulResponse, UserProfile, FeedPostsResponse, FeedPost } from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import { CookieTokenObject, getCookiesOrRedirect } from "../../helpers/cookies/cookiesHandler.ts";
import { safeAPICall } from "../../fetching/fetchUtils.ts";
import {
    fetchDeletePost,
    fetchFollow,
    fetchUnfollow,
    fetchUsersPosts,
} from "../../fetching/fetchSocial.ts";
import { NavigateFunction } from "react-router-dom";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import estimatePostSize from "../../helpers/postSizeEstimator.ts";
import { useVirtualizer } from "@tanstack/react-virtual";

interface ProfilePageProps {
    userData: UserProfile;
    me: boolean;
}

interface ProfilePost {
    estimateSize: number;
    postData: FeedPost;
}
type ProfilePosts = ProfilePost[];

export type ProfilePostsSectionFlag = "posts" | "replies" | "likes";
export type OrderPostsByFlag = "fresh" | "old" | "mostLiked" | "popularNow"

const getProfileFetchData = async (tokens: CookieTokenObject, navigate: NavigateFunction, userId: string, orderBy: OrderPostsByFlag, section: ProfilePostsSectionFlag, page: number): Promise<ProfilePosts | undefined> => {
    const fetchedResults = await safeAPICall<FeedPostsResponse>(tokens, fetchUsersPosts, navigate, undefined, userId, section, orderBy, page);

    if (fetchedResults.success) {
        return fetchedResults.data.map((post) => {
            const estimateSize = estimatePostSize(post.picturesURLs.length, post.isReply);
            return {
                estimateSize: estimateSize,
                postData: post,
            };
        });
    }

    return undefined;
}

const createSearchInfiniteQueryOptions = (tokens: CookieTokenObject, navigate: NavigateFunction, userId: string, orderBy: OrderPostsByFlag, section: ProfilePostsSectionFlag) => {
    return infiniteQueryOptions({
        queryKey: ["profile", orderBy, section],
        queryFn: ({pageParam}) => getProfileFetchData(tokens, navigate, userId, orderBy, section, pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
            if (lastPage) {
                if (!lastPage || lastPage.length === 0) {
                    return undefined;
                }
                return lastPageParam + 1;
            } else {
                return undefined;
            }
        }
    })
}

export const ProfilePage = (props: ProfilePageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ profilePostsSection, setProfilePostsSection ] = useState<ProfilePostsSectionFlag>("posts");
    const [ orderBy, setOrderBy ] = useState<OrderPostsByFlag>("fresh");
    const [ isFollowing, setFollowing ] = useState<boolean>(props.userData.isFollowing);


    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createSearchInfiniteQueryOptions(tokens, navigate, props.userData.userId, orderBy, profilePostsSection))
    const scrollRef = useRef<HTMLDivElement>(null);

    const profilePostsData = (data?.pages.flatMap((page => page)) ?? []).filter((elem) => elem !== undefined);

    const virtualizer = useVirtualizer({
        count: profilePostsData?.length ?? 0,
        estimateSize: (index) => {
            const elem = profilePostsData[index]
            return elem?.estimateSize ?? 0
        },
        getScrollElement: () => scrollRef.current,
        overscan: 48
    });

    const virtualItems= virtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!hasNextPage || isFetchingNextPage || !lastItem) return;
        if (lastItem.index >= profilePostsData.length - 1)
            fetchNextPage();
    }, [virtualItems, hasNextPage, fetchNextPage]);

    const changeOrder = (newOrder: OrderPostsByFlag) => {
        if (newOrder !== orderBy) {
            setOrderBy(newOrder);
        }
    }

    const changeSection = (newSection: ProfilePostsSectionFlag) => {
        if (newSection !== profilePostsSection) {
            setProfilePostsSection(newSection);
        }
    }

    const fetchUserProfilePosts = () => {

    };


    const followAction = async (follow: boolean) => {
        if (props.me) {
            return;
        }

        if (follow && !isFollowing) {
            await safeAPICall<SuccessfulResponse>(tokens, fetchFollow, navigate, undefined, props.userData.userId);
            return;
        }
        if (!follow && isFollowing) {
            await safeAPICall<SuccessfulResponse>(tokens, fetchUnfollow, navigate, undefined, props.userData.userId);
        }
    };

    const sendMessage = (message: string) => {
        if (!props.me) {
            return;
        }
        // TODO
    };

    const deletePost = async (postId: string) => {
        if (!props.me) {
            return;
        }
        await safeAPICall<SuccessfulResponse>(tokens, fetchDeletePost, navigate, undefined, postId);
        // TODO: Remove local post
    };

    const changePost = (postId: string) => {
        if (!props.me) {
            return;
        }
        // TODO
    };

    const virtualizedComponentsProps = profilePostsData.map((post) => { return { postData: post.postData, isMyPost: false} } )

    return(
        <div className="w-2/3 mx-auto m-8 bg-white/10 rounded-xl p-6 backdrop-blur">
            <div className="flex justify-center items-center gap-4 text-white">
                <div>
                    { props.userData.avatarURL ? <img
                        src={props.userData.avatarURL}
                        alt={`${props.userData.username} avatar`}
                        className="w-8 h-8 rounded-full"
                    /> : <img src="/uknown-user-image.jpg" alt={`${props.userData.username} avatar`} className="w-32 h-32 hover:scale-105 transition-all rounded-full" /> }
                </div>
                <div>
                    <h2 className="text-xl font-semibold ">{props.userData.username}</h2>
                    <p className="text-gray-300">Joined {props.userData.joined.toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">{props.userData.followers}</p>
                    <p>Followers</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">{props.userData.followed}</p>
                    <p>Following</p>
                </div>
                { !props.me ? <div className="flex justify-center gap-4 text-white">
                    <div className="flex justify-center items-center">
                        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all">
                            Follow
                        </button>
                    </div>
                    <div className="flex justify-center items-center">
                        <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all">
                            Message
                        </button>
                    </div>
                </div> : null }
            </div>

            <div className="flex justify-center items-center gap-4 mt-6 text-white">
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all" >Posts</button>
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all" >Replies</button>
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all" >Liked</button>
            </div>

            <div ref={scrollRef} className="mx-auto w-2/3 mb-16 h-[800px] overflow-y-auto flex flex-col gap-4">
                <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                    <VirtualizedList DisplayedComponent={FlowPost} virtualizer={virtualizer} virtualItems={virtualItems} allData={profilePostsData} componentProps={virtualizedComponentsProps} />
                </div>
            </div>

        </div>
    );
}

export const MyProfilePage = (props: ProfilePageProps) => {
    return(
        <ProfilePage userData={props.userData}  me={props.me} />
    );
}
