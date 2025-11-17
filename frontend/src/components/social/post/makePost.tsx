import React, {ChangeEvent, useState} from "react";

import { fetchUploadPostPictures } from "../../../fetching/fetchMedia.ts";
import {allowedImageExtensions, maxPostImagesUpload, fileIsTooBigMessage, specificPostURI} from "../../../consts.ts";
import {safeAPICall} from "../../../fetching/fetchUtils.ts";
import {LoadPostResponse, PostBaseResponse, SuccessfulResponse} from "../../../fetching/responseDTOs.ts";
import {getCookiesOrRedirect} from "../../../helpers/cookies/cookiesHandler.ts";
import {useNavigate} from "react-router";
import {fetchMakePost} from "../../../fetching/fetchSocial.ts";
import {validateMakePost} from "../../../helpers/validatorts.ts";

type MakePostProps = {
    postType:  "post" | "reply"
    parentPostId: string | null;
};

const MakePost = (props: MakePostProps) => {
    if (props.postType === "post" && props.parentPostId || props.postType === "reply" && !props.parentPostId) {
        throw new Error("Invalid postType provided");
    }

    const navigate = useNavigate();
    const tokens = getCookiesOrRedirect(navigate);

    const [ title, setTitle ] = useState("");
    const [ text, setText ] = useState("");
    const [ images, setImages ] = useState<File[]>([]);
    const [ errorMessage, setErrorMessage ] = useState("");


    const createPost = async () => {
        if (!tokens.access || !tokens.refresh) {
            return;
        }

        const potentialValidationMessage = validateMakePost({ title: title, text: text });

        if (potentialValidationMessage) {
            setErrorMessage(potentialValidationMessage);
            return;
        }

        const createdPost = await safeAPICall<PostBaseResponse>(tokens, fetchMakePost, navigate, setErrorMessage, title, text, props.parentPostId);

        if (!createdPost.success) {
            return;
        }

        for (let i = 0; i < images.length; i++) {
            console.log(await safeAPICall<SuccessfulResponse>(tokens, fetchUploadPostPictures, navigate, setErrorMessage, createdPost.data.postId, images[i]));
        }

        navigate(specificPostURI(createdPost.data.postId));
    };

    const uploadImageLocal = (e: ChangeEvent<HTMLInputElement>): void => {
        if (!e.target.files || e.target.files.length + images.length > maxPostImagesUpload) { return; }
        // https://stackoverflow.com/questions/25333488/why-isnt-the-filelist-object-an-array
        const imagesArray = Array.from(e.target.files);
        setImages((prevState) => [...prevState, ...imagesArray]);
    };

    const removeImageLocal = (index: number): void => {
        const newImages = images.filter((i, ImageIndex) => index !== ImageIndex);
        setImages(newImages);
    }

    return(
        <div className={`${props.postType === "post" ? "w-full" : "w-[900px]"} mx-auto p-4 bg-white/10 backdrop-blur rounded-2xl shadow-sm text-white`}>
            <div className="mb-6 space-y-3">
                <div className="text-xl font-semibold">{props.postType == "post" ? "Make a Post" : "Make a Reply"}</div>

                <input
                    type="text"
                    placeholder="Title..."
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                />

                <textarea
                    placeholder="Text..."
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-white/5 text-white placeholder-white/60 rounded-lg px-4 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                ></textarea>

                { images.length < maxPostImagesUpload ? (<div className="flex items-center justify-between">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => uploadImageLocal(e)}
                        className="text-sm text-white/60 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:hover:bg-white/20 file:cursor-pointer"
                    />
                </div>) : null }

                {images && (
                    images.map((image, i) => (
                        <div key={i} className="flex justify-between items-center mb-2">
                            <p><span>{image.name}</span><span className="ml-2">{(image.size / 1048576).toFixed(2)} MB</span></p>
                            <button className="p-1 rounded text-red-300 border border-red-300 hover:bg-red-300/30" onClick={() => removeImageLocal(i)}>Remove</button>
                        </div>
                    ))
                )}
                <p className="text-sm text-white/50">Up to 3 images</p>

                {errorMessage && (<p className="p-2 rounded text-red-300 border border-red-300">{errorMessage}</p>)}

                <button
                    className="w-full py-2 mt-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition border border-white/20"
                    onClick={() => createPost()}
                >
                    {props.postType === "post" ? "Post" : "Reply"}
                </button>
            </div>
        </div>
    );
};

export default MakePost;

