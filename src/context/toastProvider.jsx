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

    console.log('ToastProvider toasts:', toasts);
    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="flex flex-col items-end fixed top-4 right-4 space-y-3 z-50 w-max max-w-[90vw]">
                {toasts.map(t => (
                    <ShowApiMessage
                        key={t.id}
                        id={t.id}
                        message={t.message}
                        onClose={ removeToast }
                    />
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
