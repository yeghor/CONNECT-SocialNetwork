import React, { useRef, useEffect } from "react";

const ActivePicture = (props: {
    closeModal: () => void,
    imageURL: string
}) => {
    const activePictureRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (activePictureRef.current && !activePictureRef.current.contains(e.target as Node)) {
                props.closeModal();
            }
        }; 
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8">
            <img 
                ref={activePictureRef}
                src={props.imageURL} 
                alt="Full screen view" 
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
            />
            
            <button 
                onClick={props.closeModal}
                className="absolute top-5 right-5 text-white text-3xl hover:scale-110 transition-transform"
            >
                &times;
            </button>
        </div>
    );
};

export default ActivePicture;