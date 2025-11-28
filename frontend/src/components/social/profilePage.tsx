import React, { useState, useEffect } from "react";
import {SuccessfulResponse, UserProfile} from "../../fetching/responseDTOs.ts";
import { useNavigate } from "react-router";
import { getCookiesOrRedirect } from "../../helpers/cookies/cookiesHandler.ts";
import {safeAPICall} from "../../fetching/fetchUtils.ts";
import {fetchDeletePost, fetchFollow, fetchUnfollow} from "../../fetching/fetchSocial.ts";

interface ProfilePageProps {
    userData: UserProfile;
    me: boolean;
}

type ProfilePostsSection = "posts" | "replies" | "likes";
type OrderPostsBy = "fresh" | "old" | "mostLiked" | "popularNow"

export const ProfilePage = (props: ProfilePageProps) => {
    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ profilePostsSection, setProfilePostsSection ] = useState<ProfilePostsSection>("posts");
    const [ orderBy, setOrderBy ] = useState<OrderPostsBy>("fresh");
    const [ isFollowing, setFollowing ] = useState<boolean>(props.userData.isFollowing);

    const changeOrder = (newOrder: OrderPostsBy) => {
        if (newOrder !== orderBy) {
            setOrderBy(newOrder);
        }
    }

    const changeSection = (newSection: ProfilePostsSection) => {
        if (newSection !== profilePostsSection) {
            setProfilePostsSection(newSection);
        }
    }

    const fetchUserProfilePosts = () => {

    };

    useEffect(() => {

    }, [])

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
    };


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

        </div>
    );
}

export const MyProfilePage = (props: ProfilePageProps) => {
    return(
        <ProfilePage userData={props.userData}  me={props.me} />
    );
}
