// src/context/ToastProvider.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import ShowApiMessage from "../apiResponse.jsx";
import { v4 as uuidv4 } from 'uuid';

const ToastContext = createContext({ addToast: () => { } });

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message) => {
        const id = uuidv4();
        setToasts(prev => [...prev, { id, message }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="
                flex flex-col items-end fixed top-4 right-4 // Position toasts in the top-right
                space-y-3 z-[9999]
                w-full max-w-md sm:max-w-lg md:max-w-xl // Max width ensures responsiveness
                pointer-events-none // Allow clicks to pass through empty space
            ">
                {toasts.map(t => (
                    // Wrap the ShowApiMessage to enforce max width on the outer container
                    // and allow pointer-events on the toast itself
                    <div key={t.id} className="w-full sm:w-auto pointer-events-auto">
                        <ShowApiMessage
                            id={t.id}
                            message={t.message}
                            onClose={ removeToast }
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be inside ToastProvider");
    return ctx.addToast;
}
