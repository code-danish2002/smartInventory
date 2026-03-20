import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import CreatableSelect from 'react-select/creatable';
import { X, Upload, Hash, Info } from 'lucide-react';
import { commonSelectProps } from '../../utils/CommonCSS.jsx';
import { useToast } from '../../context/toastProvider.jsx';

const SerialNumberModal = ({ isOpen, onClose, serials = [], remarks = '', initialAllowDuplicates = false, onSave, maxQuantity }) => {
    const addToast = useToast();
    const [localSerials, setLocalSerials] = useState(serials || []);
    const [localRemarks, setLocalRemarks] = useState(remarks || '');
    const [entryMode, setEntryMode] = useState('manual'); // 'manual' or 'csv'
    const [fileName, setFileName] = useState('');
    const [allowDuplicates, setAllowDuplicates] = useState(initialAllowDuplicates);

    useEffect(() => {
        if (isOpen) {
            setLocalSerials(serials || []);
            setLocalRemarks(remarks || '');
            setAllowDuplicates(initialAllowDuplicates);
        }
    }, [isOpen, serials, remarks, initialAllowDuplicates]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            const lines = content.split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');
            setLocalSerials(prev => {
                const combined = allowDuplicates
                    ? [...prev, ...lines]
                    : [...new Set([...prev, ...lines])];
                return combined;
            });
        };
        reader.readAsText(file);
    };

    const handleRemoveSerial = (indexToRemove) => {
        setLocalSerials(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSave = async () => {
        const success = await onSave(localSerials, localRemarks, allowDuplicates);
        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 z-9999 outline-none"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl max-h-[80vh] rounded-2xl shadow-2xl overflow-auto border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Hash size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Serial Numbers</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Entry & Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={allowDuplicates}
                                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Allow Duplicates</span>
                        </label>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-400 dark:text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Info */}
                    {/* <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Info size={14} />
                            <span className="text-xs font-bold uppercase tracking-tight">Total Required: {maxQuantity || 'Any'}</span>
                        </div>
                        <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {localSerials.length} Entered
                        </div>
                    </div> */}

                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setEntryMode('manual')}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${entryMode === 'manual' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => setEntryMode('csv')}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${entryMode === 'csv' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            CSV Upload
                        </button>
                    </div>

                    {entryMode === 'manual' ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Type & Enter</label>
                                <CreatableSelect
                                    isMulti
                                    placeholder="Enter serial numbers..."
                                    value={localSerials.map((s, idx) => ({ label: s, value: `${s}#${idx}` }))}
                                    onChange={(newValue) => {
                                        const serials = newValue ? newValue.map(v => v.value.split('#')[0]) : [];
                                        setLocalSerials(serials);
                                    }}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    {...commonSelectProps}
                                    isOptionSelected={(option, selectValue) => {
                                        if (allowDuplicates) return false;
                                        return selectValue.some(val => val.label === option.label);
                                    }}
                                    isValidNewOption={(inputValue) => {
                                        if (!inputValue) return false;
                                        if (allowDuplicates) return true;
                                        return !localSerials.includes(inputValue);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {fileName ? (
                                    <div className="space-y-2">
                                        <Upload size={32} className="mx-auto text-indigo-500 mb-3" />
                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fileName}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-black">File Selected</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} className="mx-auto text-gray-300 dark:text-slate-700 group-hover:text-indigo-500 mb-3 transition-colors" />
                                        <p className="text-sm font-bold text-gray-600 dark:text-slate-400">Click or drag CSV file</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">Supported: .csv, .txt</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Unified Chip View - Only for CSV mode as manual has CreatableSelect chips */}
                    {entryMode === 'csv' && localSerials.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Entered Serials</label>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-gray-50/50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-800 scrollbar-thin">
                                {localSerials.map((s, idx) => (
                                    <div key={`${s}-${idx}`} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:border-red-200 dark:hover:border-red-900/30 group">
                                        <span>{s}</span>
                                        <button
                                            onClick={() => handleRemoveSerial(idx)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Remarks Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Remarks</label>
                        <textarea
                            value={localRemarks}
                            onChange={(e) => setLocalRemarks(e.target.value)}
                            placeholder="Enter any remarks or comments..."
                            className="w-full h-24 p-4 text-xs font-medium rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all dark:text-slate-300 dark:placeholder-slate-600"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        Save Details
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SerialNumberModal;
