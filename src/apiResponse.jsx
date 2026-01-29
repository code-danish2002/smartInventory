import React, { useEffect, useState } from "react";
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { IoInformationCircle } from "react-icons/io5";
import { TbServerOff } from "react-icons/tb";
import { VscError } from "react-icons/vsc";
import { FaQuestion } from "react-icons/fa";
import { Warning } from "./utils/icons";

export default function ShowApiMessage({ id, message, onClose }) {
    const [visible, setVisible] = useState(true);

    // Extract status code if available.
    const statusCode = message?.response?.status || message?.status;
    const rawDetail = message?.response?.data?.message || message?.response?.data?.detail || message?.response?.data?.error || message?.response?.statusText || message?.['error'] || message?.message;
    const messageDetails = normalizeDetails(rawDetail);
    console.log('statusCode', statusCode, 'message', message, 'rawDetail', rawDetail, messageDetails, 'message', message?.response?.data?.detail, 'other', message?.message);

    // Variables for displaying the message.
    let statusType = "";
    let defaultTitle = "";
    let defaultMessage = "";
    let icon = "";
    let iconBgColor = "";
    let textColor = "";

    // Determine what to show based on the status code
    if (!statusCode && message?.message) {
        // No status code, but there's an error message: network error/timeout/no response.
        statusType = "no-response";
        defaultTitle = "No Response";
        defaultMessage =
            "No response from server. Please check your connection or try again later.";
        icon = <Warning />; // Warning icon
        iconBgColor = "bg-yellow-100";
        textColor = "text-yellow-600";
    } else if (statusCode >= 100 && statusCode < 200) {
        // 1xx Informational: rarely handled on the client but we include it for completeness.
        statusType = "informational";
        defaultTitle = "Info";
        defaultMessage =
            messageDetails || "Informational response received.";
        icon = <IoInformationCircle className="w-5 h-5" />;
        iconBgColor = "bg-blue-100";
        textColor = "text-blue-600";
    } else if (statusCode >= 200 && statusCode < 300) {
        // 2xx Success responses.
        statusType = "success";
        defaultTitle = "Success";
        defaultMessage = message?.data?.message ||
            message?.response?.data?.detail || messageDetails || "Request completed successfully.";
        icon = <AiOutlineCheckCircle className="w-6 h-6" />;
        iconBgColor = "bg-green-100";
        textColor = "text-green-600";
    } else if (statusCode >= 300 && statusCode < 400) {
        // 3xx Redirect responses.
        statusType = "redirect";
        defaultTitle = "Redirected";
        defaultMessage =
            messageDetails || "Request was redirected.";
        icon = "↪";
        iconBgColor = "bg-purple-100";
        textColor = "text-purple-600";
    } else if (statusCode >= 400 && statusCode < 500) {
        // 4xx Client error responses.
        statusType = "client-error";
        defaultTitle = "Error";
        defaultMessage =
            messageDetails || "There was an error processing your request.";
        icon = <VscError className="w-6 h-6" />;
        iconBgColor = "bg-red-100";
        textColor = "text-red-600";
    } else if (statusCode >= 500 && statusCode < 600) {
        // 5xx Server error responses.
        statusType = "server-error";
        defaultTitle = "Server Error";
        defaultMessage =
            messageDetails || "There was a server error processing your request.";
        icon = <TbServerOff className="w-6 h-6" />;
        iconBgColor = "bg-red-100";
        textColor = "text-red-600";
    } else {
        // Fallback in case we get an unknown status code.
        statusType = "unknown";
        defaultTitle = "Unknown";
        defaultMessage =
            messageDetails || "An unknown error occurred.";
        icon = <FaQuestion className="w-5 h-5" />;
        iconBgColor = "bg-gray-100";
        textColor = "text-gray-600";
    }

    // Optionally auto-close the message after 5 seconds.
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose(id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose, id]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose(id);
    };

    if (!visible) return null;
    const borderColor = {
        success: "border-green-300",
        "client-error": "border-red-300",
        "server-error": "border-red-300",
        "no-response": "border-yellow-300",
        informational: "border-blue-300",
        redirect: "border-purple-300",
        unknown: "border-gray-300",
    }[statusType] || "border-gray-300";

    return (
        <div className={`flex justify-between items-center max-w-screen w-full p-2 rounded-lg shadow-lg border-2 ${borderColor} bg-white`}>

            {/* Optional Icon */}
            {icon && (
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 `}>
                    <span className={`text-lg ${textColor}`}>{icon}</span>
                </div>
            )}

            {/* Title + Message (One line, ellipsized) */}
            <div className="flex-1 break-words text-sm text-gray-700">
                {defaultTitle && <strong className={`mr-1 ${textColor}`}>{defaultTitle}:</strong>}
                <span >{defaultMessage}</span>
            </div>

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full ml-4 text-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
}

function normalizeDetails(detail, genericMessage = "No details provided.") {
    // 1) Nothing there?
    if (detail === null || detail === undefined) {
        return [genericMessage];
    }

    // 2) Plain string
    if (typeof detail === "string") {
        return detail;
    }

    // 3) Pydantic‑style array of { loc, msg }
    if (Array.isArray(detail) && detail.every(d => d.loc && d.msg)) {
        return detail.map(({ loc, msg }) => {
            // drop the leading "body" / "query" / "path"
            const path = loc
                .filter(p => p !== "body" && p !== "query" && p !== "path")
                .join(".");
            return path ? `${path}: ${msg}` : msg;
        });
    }

    // 4) Anything else (object, number, etc.) → stringify
    try {
        return [typeof detail === "object"
            ? JSON.stringify(detail, null, 2)
            : String(detail)
        ];
    } catch {
        return [genericMessage];
    }
}
