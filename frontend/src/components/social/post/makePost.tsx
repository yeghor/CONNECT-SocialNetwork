import React, {ChangeEvent, useState} from "react";

import { fetchUploadPostPictures } from "../../../fetching/fetchMedia.ts";
import { allowedImageExtensions, maxPostImagesUpload, fileIsTooBigMessage } from "../../../consts.ts";


const MakePost = () => {
    const [ title, setTitle ] = useState("");
    const [ text, setText ] = useState("");
    const [ images, setImages ] = useState<File[]>([]);
    const [ errorMessage, setErrorMessage ] = useState("");


    const createPost = () => {
        
    };

    const uploadImageLocal = (e: ChangeEvent<HTMLInputElement>): void => {
        if (!e.target.files || e.target.files.length + images.length > maxPostImagesUpload) { return; }
        // https://stackoverflow.com/questions/25333488/why-isnt-the-filelist-object-an-array
        const imagesArray = Array.from(e.target.files);
        setImages((prevState) => [...prevState, ...imagesArray]);
    };

    const removeImageLocal = (index: number): void => {

    }

    return(
        <div className="w-full mx-auto p-4 bg-white/10 backdrop-blur rounded-2xl shadow-sm m-12 text-white">
            <div className="mb-6 space-y-3">
                <div className="text-xl font-semibold">Make a Post</div>

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
                            <p><span>{image.name}.{image.type}</span><span>{(image.size / 1048576).toFixed(2)} MB</span></p>
                            <button className="p-1 rounded text-red-300 border border-red-300" onClick={() => removeImageLocal(i)}>Remove</button>
                        </div>
                    ))
                )}
                <p className="text-sm text-white/50">Up to 3 images</p>

                {errorMessage && (<p className="py-2 rounded text-red-300 border border-red-300">{errorMessage}</p>)}

                <button
                    className="w-full py-2 mt-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition border border-white/20"
                    onClick={() => createPost()}
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default MakePost;

