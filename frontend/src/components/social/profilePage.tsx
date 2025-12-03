import React, {useState, useEffect, useRef} from "react";

import VirtualizedList from "../butterySmoothScroll/virtualizedList.tsx";
import FlowPost from "./post/flowPost.tsx";

import { SuccessfulResponse, UserProfile, FeedPostsResponse, FeedPost } from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import { CookieTokenObject, getCookiesOrRedirect } from "../../helpers/cookies/cookiesHandler.ts";
import { safeAPICall } from "../../fetching/fetchUtils.ts";
import {
    fetchFollow,
    fetchUnfollow,
    fetchUsersPosts,
} from "../../fetching/fetchSocial.ts";
import { NavigateFunction } from "react-router-dom";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import estimatePostSize from "../../helpers/postSizeEstimator.ts";
import { useVirtualizer } from "@tanstack/react-virtual";
import { createInfiniteQueryOptionsUtil, infiniteQieryingFetchGuard } from "../butterySmoothScroll/scrollVirtualizationUtils.ts";

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

export const ProfilePage = (props: ProfilePageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ profilePostsSection, setProfilePostsSection ] = useState<ProfilePostsSectionFlag>("posts");
    const [ orderBy, setOrderBy ] = useState<OrderPostsByFlag>("fresh");
    const [ isFollowing, setFollowing ] = useState<boolean>(props.userData.isFollowing);
    const [ followTimeout, setFollowTimeout ] = useState<boolean>(false);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(getProfileFetchData, [tokens, navigate, props.userData.userId, orderBy, profilePostsSection], ["profile", orderBy, profilePostsSection]))
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
        if (infiniteQieryingFetchGuard(hasNextPage, isFetchingNextPage, lastItem, profilePostsData.length)) fetchNextPage();
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

    const followAction = async () => {
        if (props.me || followTimeout) {
            return;
        }
        
        setFollowTimeout(true);

        if (!isFollowing) {
            setFollowing(true);
            props.userData.followers += 1;
            await safeAPICall<SuccessfulResponse>(tokens, fetchFollow, navigate, undefined, props.userData.userId);
        } else {
            setFollowing(false);
            props.userData.followers -= 1;
            await safeAPICall<SuccessfulResponse>(tokens, fetchUnfollow, navigate, undefined, props.userData.userId);
        }

        setTimeout(() => setFollowTimeout(false), 300)

    };

    const sendMessage = (message: string) => {
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
                <div className="flex justify-center items-center">
                    {
                        props.userData.me ?
                            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all">
                                Manage Profile
                            </button>
                        :
                            <div className="flex justify-start gap-4">
                                <button onClick={() => followAction()} className={`w-32 px-6 py-2 ${isFollowing ? "bg-white/20 scale-105" : "bg-white/10"} hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all`}>
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button className={`w-32 px-6 py-2 bg-white/10 hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all`}>
                                    Message
                                </button>
                            </div>
                    }
                </div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-6 text-white">
                <button onClick={() => changeSection("posts")} className={`px-6 py-2 ${profilePostsSection == "posts" ? "bg-white/20 scale-105" : "bg-white/10"} hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all`}>Posts</button>
                <button onClick={() => changeSection("replies")} className={`px-6 py-2 ${profilePostsSection == "replies" ? "bg-white/20 scale-105" : "bg-white/10"} hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all`}>Replies</button>
                <button onClick={() => changeSection("likes")} className={`px-6 py-2 ${profilePostsSection == "likes" ? "bg-white/20 scale-105" : "bg-white/10"} hover:bg-white/20 hover:scale-105 rounded-full text-white font-semibold transition-all`}>Liked Posts</button>
            </div>

            <div className="w-2/3 mx-auto flex justify-between items-center mt-8 px-4 py-2 rounded-full bg-white/10 text-white">
                <button onClick={() => changeOrder("fresh")} className={`px-4 py-1 rounded-full font-semibold transition-all duration-200 ${ orderBy === "fresh" ? "bg-white/20 scale-105" : "bg-white/10" } hover:bg-white/20 hover:scale-105`}>
                    Fresh
                </button>
                <button onClick={() => changeOrder("old")} className={`px-4 py-1 rounded-full font-semibold transition-all duration-200 ${ orderBy === "old" ? "bg-white/20 scale-105" : "bg-white/10" } hover:bg-white/20 hover:scale-105`}>
                    Old
                </button>
                <button onClick={() => changeOrder("popularNow")} className={`px-4 py-1 rounded-full font-semibold transition-all duration-200 ${ orderBy === "popularNow" ? "bg-white/20 scale-105" : "bg-white/10" } hover:bg-white/20 hover:scale-105`}>
                    Popular
                </button>
                <button onClick={() => changeOrder("mostLiked")} className={`px-4 py-1 rounded-full font-semibold transition-all duration-200 ${ orderBy === "mostLiked" ? "bg-white/20 scale-105" : "bg-white/10" } hover:bg-white/20 hover:scale-105`}>
                    Most Liked
                </button>
            </div>

            <div ref={scrollRef} className="mx-auto w-2/3 mb-16 h-[800px] overflow-y-auto flex flex-col gap-4 my-8">
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
