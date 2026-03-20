import React from "react";
import { FaClipboardList } from "react-icons/fa";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function NoDataAvailable({ title = "No Data Available", explanation }) {
    const thisIcon = title === "No Data Available" ? <FaClipboardList size={40} /> : <AlertCircle size={40} />;
    explanation = explanation || "It seems there’s nothing to show right now. Keep refreshing the page, clear filters or try again later.";
    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-slate-50 to-white dark:from-[#0b1120] dark:to-[#0f172a] text-center p-6 transition-colors duration-500">
            {/* Icon Section */}
            <div className="bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-5 rounded-full shadow-md mb-4 animate-bounce">
                {thisIcon}
            </div>

            {/* Message Section */}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                {title}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md">
                {explanation}
            </p>

            {/* Optional Refresh Button */}
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-md shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 flex items-center active:scale-95"
            >
                <RefreshCw className={`w-4 h-4 mr-2`} /> Refresh
            </button>
        </div>
    );
}
