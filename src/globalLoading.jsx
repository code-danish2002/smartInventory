import React from "react";

export default function GlobalLoading() {
    return (
        <div className="modal-overlay z-[9999]">
            <div className="flex flex-col items-center gap-4">
                <div className="loader"></div>
                <p className="text-white font-medium animate-pulse tracking-wide">Processing...</p>
            </div>
            <style jsx>{`
                .loader {
                    width: 50px;
                    aspect-ratio: 1;
                    display: grid;
                    border: 4px solid #0000;
                    border-radius: 50%;
                    border-right-color: #3b82f6;
                    animation: l15 1s infinite linear;
                }
                .loader::before,
                .loader::after {    
                    content: "";
                    grid-area: 1/1;
                    margin: 2px;
                    border: inherit;
                    border-radius: 50%;
                    animation: l15 2s infinite;
                }
                .loader::after {
                    margin: 8px;
                    animation-duration: 3s;
                }
                @keyframes l15 { 
                    100% { transform: rotate(1turn); }
                }
            `}</style>
        </div>
    );
};

const ContentLoading = () => {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[50vh] p-8">
            <div
                className="w-12 h-12 border-4 border-t-4 border-t-sky-500 border-gray-200 rounded-full animate-spin"
                role="status"
                aria-label="Content loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export { ContentLoading };