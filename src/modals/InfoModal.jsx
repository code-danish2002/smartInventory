import React from 'react';
import { X } from 'lucide-react';

const InfoModal = ({ isOpen, onClose, title, data }) => {
    if (!isOpen) return null;

    // Filter out internal React/State keys and ID-related fields
    const displayData = Object.entries(data || {}).filter(([key]) => {
        const lowerKey = key.toLowerCase();
        return !lowerKey.startsWith('_') &&
            !lowerKey.endsWith('id') &&
            lowerKey !== 'id' &&
            typeof data[key] !== 'object';
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transform transition-all scale-in-center">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                    <div className="space-y-4">
                        {displayData.length > 0 ? (
                            displayData.map(([key, value]) => (
                                <div key={key} className="flex flex-col border-b border-gray-50 dark:border-slate-800 pb-2 last:border-0">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-slate-500">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200 break-words">
                                        {value?.toString() || 'N/A'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-slate-400 text-sm italic">No details available</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
