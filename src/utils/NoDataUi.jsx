import React from "react";
import { FaClipboardList } from "react-icons/fa";

export default function NoDataAvailable() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-slate-50 to-white text-center p-6">
            {/* Icon Section */}
            <div className="bg-red-100 text-red-500 p-5 rounded-full shadow-md mb-4 animate-bounce">
                <FaClipboardList size={40} />
            </div>

            {/* Message Section */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No Data Available
            </h2>
            <p className="text-gray-500 max-w-md">
                It seems there’s nothing to show right now. Try refreshing the page or checking again later.
            </p>

            {/* Optional Refresh Button */}
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 transition-all duration-300"
            >
                Refresh
            </button>
        </div>
    );
}
