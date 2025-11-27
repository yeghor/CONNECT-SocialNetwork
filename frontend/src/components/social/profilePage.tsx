import React from "react";
import {UserProfileResponse} from "../../fetching/responseDTOs.ts";

interface ProfilePageProps {
    userData: UserProfile;
}

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

export const ProfilePage = (props: ProfilePageProps) => {
    console.log("rendering user")
    return(
        <div className="max-w-md mx-auto bg-white/10 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
                <img
                    src={props.userData.avatarURL}
                    alt={`${props.userData.username} avatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                    <h2 className="text-xl font-semibold text-white">{props.userData.username}</h2>
                    <p className="text-sm text-white/70">Joined {props.userData.joined.toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex justify-around mb-4 text-white">
                <div className="text-center">
                    <p className="font-bold">{props.userData.followers}</p>
                    <p className="text-sm text-white/70">Followers</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">{props.userData.followed}</p>
                    <p className="text-sm text-white/70">Following</p>
                </div>
            </div>

            <div className="flex justify-center">
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold transition">
                    Follow
                </button>
            </div>
        </div>
    );
}

export const MyProfilePage = (props: ProfilePageProps) => {
    return(
        <div className="max-w-md mx-auto bg-white/10 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
                <img
                    src={props.userData.avatarURL}
                    alt={`${props.userData.username} avatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                    <h2 className="text-xl font-semibold text-white">{props.userData.username}</h2>
                    <p className="text-sm text-white/70">Joined {props.userData.joined.toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex justify-around mb-4 text-white">
                <div className="text-center">
                    <p className="font-bold">{props.userData.followers}</p>
                    <p className="text-sm text-white/70">Followers</p>
                </div>
                <div className="text-center">
                    <p className="font-bold">{props.userData.followed}</p>
                    <p className="text-sm text-white/70">Following</p>
                </div>
            </div>

            <div className="flex justify-center">
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold transition">
                    Follow
                </button>
            </div>
        </div>
    );
}
