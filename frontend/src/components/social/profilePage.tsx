import React, { useState, useEffect, useRef } from "react";

import VirtualizedList from "../butterySmoothScroll/virtualizedList.tsx";
import FlowPost from "./post/flowPost.tsx";

import { SuccessfulResponse, UserProfile, FeedPostsResponse, FeedPost } from "../../fetching/DTOs.ts";
import { useNavigate, Link } from "react-router";
import { CookieTokenObject, getCookieTokens } from "../../helpers/cookies/cookiesHandler.ts";
import { safeAPICallPrivate, safeAPICallPublic } from "../../fetching/fetchUtils.ts";
import {
    fetchFollow,
    fetchUnfollow,
    fetchUsersPosts,
} from "../../fetching/fetchSocial.ts";
import { NavigateFunction } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import estimatePostSize from "../../helpers/postSizeEstimator.ts";
import { useVirtualizer } from "@tanstack/react-virtual";
import { createInfiniteQueryOptionsUtil, infiniteQieryingFetchGuard } from "../butterySmoothScroll/scrollVirtualizationUtils.ts";
import ManageProfileModal from "./profile/manageProfileModal.tsx";
import { loginURI, tz } from "../../consts.ts";
import { displayDayWithTZ } from "../../helpers/dateUtils.ts";

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

const getProfileData = async (tokens: CookieTokenObject, navigate: NavigateFunction, userId: string, orderBy: OrderPostsByFlag, section: ProfilePostsSectionFlag, page: number): Promise<ProfilePosts> => {
    const fetchedResults = await safeAPICallPublic<FeedPostsResponse>(tokens, fetchUsersPosts, navigate, undefined, userId, section, orderBy, page);

    if (fetchedResults.success) {
        return fetchedResults.data.map((post) => {
            const estimateSize = estimatePostSize(post.picturesURLs.length, post.isReply);
            return {
                estimateSize: estimateSize,
                postData: post,
            };
        });
    }

    return [];
}

export const ProfilePage = (props: ProfilePageProps) => {
    const navigate = useNavigate();
    const tokens = getCookieTokens(undefined);
    

    const [ profilePostsSection, setProfilePostsSection ] = useState<ProfilePostsSectionFlag>("posts");
    const [ orderBy, setOrderBy ] = useState<OrderPostsByFlag>("fresh");
    const [ isFollowing, setFollowing ] = useState<boolean>(props.userData.isFollowing);
    const [ followTimeout, setFollowTimeout ] = useState<boolean>(false);

    const [ showManageProfileModal, setshowManageProfileModal ] = useState(false);

    const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(createInfiniteQueryOptionsUtil(getProfileData, [tokens, navigate, props.userData.userId, orderBy, profilePostsSection], ["profile", orderBy, profilePostsSection]))
    const scrollRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
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
        if (!tokens.refresh) {
            navigate(loginURI);
            return;
        } else if (props.me || followTimeout) {
            return;
        }
        
        setFollowTimeout(true);

        if (!isFollowing) {
            setFollowing(true);
            props.userData.followers += 1;
            await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchFollow, navigate, undefined, props.userData.userId);
        } else {
            setFollowing(false);
            props.userData.followers -= 1;
            await safeAPICallPrivate<SuccessfulResponse>(tokens, fetchUnfollow, navigate, undefined, props.userData.userId);
        }

        setTimeout(() => setFollowTimeout(false), 300)

    };

    // @ts-ignore
    const virtualizedComponentsProps = profilePostsData.map((post) => { return { postData: post.postData, isMyPost: false} } )

    return(
        <div>
            { showManageProfileModal ? <ManageProfileModal avatarURL={props.userData.avatarURL} setShowManageProfileModal={setshowManageProfileModal} /> : null }
            <div className="w-2/3 mx-auto m-8 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
                <div className="flex justify-center items-center gap-8 text-white">
                    <div>
                        { props.userData.avatarURL ? <img
                            src={props.userData.avatarURL}
                            alt={`${props.userData.username} avatar`}
                            className="w-32 h-32 hover:scale-105 transition-all rounded-full border-2 border-white/20 object-cover"
                        /> : <img src="/uknown-user-image.jpg" alt={`${props.userData.username} avatar`} className="w-32 h-32 hover:scale-105 transition-all rounded-full border-2 border-white/20 object-cover" /> }
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-white/90">{props.userData.username}</h2>
                        <p className="text-sm text-white/60 mt-1">Joined {displayDayWithTZ(props.userData.joined)}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg text-white/90">{props.userData.followers}</p>
                        <p className="text-sm text-white/60">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg text-white/90">{props.userData.followed}</p>
                        <p className="text-sm text-white/60">Following</p>
                    </div>
                    <div className="flex justify-center items-center">
                        {
                            props.userData.me ?
                                <button onClick={() => setshowManageProfileModal(true)} className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-lg text-sm transition-all">
                                    Manage Profile
                                </button>
                            :
                                <div className="flex justify-start gap-3">
                                    <button onClick={() => followAction()} className={`px-6 py-2 ${isFollowing ? "bg-white/20" : "bg-white/10"} hover:bg-white/20 border border-white/10 text-white font-semibold rounded-lg text-sm transition-all`}>
                                        {isFollowing ? "Following" : "Follow"}
                                    </button>
                                    <Link to={`/make-chat/${props.userData.userId}`}>
                                        <button className={`px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold rounded-lg text-sm transition-all`}>
                                            Message
                                        </button>                                
                                    </Link>
                                </div>
                        }
                    </div>
                </div>

                <div className="flex justify-center items-center gap-3 mt-8 text-white border-b border-white/10 pb-4">
                    <button onClick={() => changeSection("posts")} className={`px-4 py-2 text-sm font-semibold transition-all ${profilePostsSection == "posts" ? "bg-white/20 border-b-2 border-white/50" : "bg-white/5 hover:bg-white/10"}  rounded-lg`}>Posts</button>
                    <button onClick={() => changeSection("replies")} className={`px-4 py-2 text-sm font-semibold transition-all ${profilePostsSection == "replies" ? "bg-white/20 border-b-2 border-white/50" : "bg-white/5 hover:bg-white/10"} rounded-lg`}>Replies</button>
                    <button onClick={() => changeSection("likes")} className={`px-4 py-2 text-sm font-semibold transition-all ${profilePostsSection == "likes" ? "bg-white/20 border-b-2 border-white/50" : "bg-white/5 hover:bg-white/10"} rounded-lg`}>Liked Posts</button>
                </div>

                <div className="w-2/3 mx-auto flex justify-between items-center gap-2 mt-8 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
                    <button onClick={() => changeOrder("fresh")} className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${ orderBy === "fresh" ? "bg-white/20" : "bg-white/10 hover:bg-white/15" }`}>
                        Fresh
                    </button>
                    <button onClick={() => changeOrder("old")} className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${ orderBy === "old" ? "bg-white/20" : "bg-white/10 hover:bg-white/15" }`}>
                        Old
                    </button>
                    <button onClick={() => changeOrder("popularNow")} className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${ orderBy === "popularNow" ? "bg-white/20" : "bg-white/10 hover:bg-white/15" }`}>
                        Popular
                    </button>
                    <button onClick={() => changeOrder("mostLiked")} className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${ orderBy === "mostLiked" ? "bg-white/20" : "bg-white/10 hover:bg-white/15" }`}>
                        Most Liked
                    </button>
                </div>

                <div ref={scrollRef} className="mx-auto w-2/3 mb-16 h-[800px] overflow-y-auto flex flex-col gap-3 my-8 rounded-lg bg-white/5 border border-white/10 p-4">
                    <div className="relative" style={{ height: `${virtualizer.getTotalSize()}px` }}>
                        <VirtualizedList DisplayedComponent={FlowPost} virtualizer={virtualizer} virtualItems={virtualItems} componentsProps={virtualizedComponentsProps} />
                    </div>
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
