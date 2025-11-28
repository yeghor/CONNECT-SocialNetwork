import React from "react";
import { UserProfile } from "../../fetching/responseDTOs.ts";

interface ProfilePageProps {
    userData: UserProfile;
    me: boolean;
}

export const ProfilePage = (props: ProfilePageProps) => {

    const fetchUserProfilePosts = () => {

    };

    const followAction = (follow: boolean) => {

    };

    const sendMessage = (message: string) => {

    };

    const deletePost = (postId: string) => {

    };

    const changePost = (postId: string) => {

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
