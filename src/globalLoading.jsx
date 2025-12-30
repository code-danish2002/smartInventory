import React from "react";

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="loader"></div>
            <style jsx>{`
                .loader {
                    border: 8px solid #f3f3f3;
                    border-top: 8px solid #3498db;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
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