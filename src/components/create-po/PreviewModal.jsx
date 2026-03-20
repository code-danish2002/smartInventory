import React, { useState } from 'react';
import Modal from 'react-modal';
import { X, CheckCircle, Package, MapPin, AlignLeft, Info, Box, ChevronDown, ChevronRight } from 'lucide-react';
import FloatingInput from '../../formElements/floatingInputBox.jsx';
import { useToast } from '../../context/toastProvider.jsx';

const renderTree = (nodes) => {
    if (!nodes || nodes.length === 0) return null;
    return (
        <div className="mt-2 space-y-2">
            {nodes.map(node => (
                <div key={node.id} className="ml-4 border-l border-gray-200 dark:border-slate-700 pl-3">
                    <div className="flex items-center gap-2 py-1">
                        {node.type === 'level' ? (
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                {node.code}
                            </span>
                        ) : (
                            <Box size={12} className="text-emerald-500" />
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            {node.type === 'level' ? (
                                node.description || 'Unnamed Level'
                            ) : (
                                <span className="flex items-center gap-1.5 flex-wrap">
                                    {node.item_type_name && <span className="text-blue-600 dark:text-blue-400 font-bold">{node.item_type_name}</span>}
                                    {(node.item_make_name || node.item_model_name) && (
                                        <>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">{[node.item_make_name, node.item_model_name].filter(Boolean).join(' ')}</span>
                                        </>
                                    )}
                                    {node.item_part_code && (
                                        <>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">{node.item_part_code}</span>
                                        </>
                                    )}
                                    {(!node.item_type_name && !node.item_make_name && !node.item_model_name && !node.item_part_code) && 'Item'}
                                    {node.item_serial_number?.length > 0 && <span className="text-gray-500 ml-1">({node.item_serial_number.length} serials)</span>}
                                </span>
                            )}
                        </span>
                        {node.type === 'level' && node.quantity && (
                            <span className="text-[10px] text-gray-500 font-medium">({node.quantity} {node.unit})</span>
                        )}
                    </div>

                    {/* Render Serial Numbers for Items */}
                    {node.type !== 'level' && node.item_serial_number && node.item_serial_number.length > 0 && (
                        <div className="mt-2 ml-5">
                            {/* <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                Serial Numbers
                            </p> */}
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 scrollbar-thin">
                                {node.item_serial_number.map((serial, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm rounded text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                        {serial}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {node.subItems && node.subItems.length > 0 && renderTree(node.subItems)}
                </div>
            ))}
        </div>
    );
};

const PreviewLineItem = ({ item, tree }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-start justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
                <div className="flex gap-3 items-center">
                    <div className="text-gray-400 dark:text-slate-500 mt-0.5">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Package size={16} className="text-emerald-500" />
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                Line {item.line_number}: {item.line_item_name}
                            </p>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 ml-6">
                            {item.description}
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.quantity_offered} {item.unit_measurement}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Offered</p>
                </div>
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30">
                    {/* Hierarchy Tree Rendering */}
                    {tree.length > 0 ? (
                        <div className="mt-1">
                            {renderTree(tree)}
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-400 italic">No hierarchy structure defined.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const PreviewModal = ({ isOpen, onClose, payload, task, onConfirm }) => {
    const [inspectionLocation, setInspectionLocation] = useState('');
    const [poRemarks, setPoRemarks] = useState('');
    const addToast = useToast();

    if (!isOpen || !payload) return null;

    const isAddItemsTask = task === 'Add Item Details';

    const handleConfirm = () => {
        if (isAddItemsTask && !inspectionLocation.trim()) {
            onClose();
            addToast({ response: { statusText: 'Inspection Location is required.' }, type: 'error', status: '400' });
            return;
        }

        const finalPayload = {
            ...payload,
            inspection_location: isAddItemsTask ? inspectionLocation : undefined,
            po_remarks: isAddItemsTask ? poRemarks : undefined,
        };

        onConfirm(finalPayload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 z-[10000] outline-none"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview Submission</h3>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{task}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-400 dark:text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
                    {/* Summary Section */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">PO Number</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{payload.po_number}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Inspector</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{payload.inspector_user || 'Assigned Inspector'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest px-1">Selected Line Items ({payload.po_line_items?.length || 0})</p>
                            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                                {payload.po_line_items?.map((item, idx) => {
                                    const treeId = item.po_line_item_id || item.summary_id;
                                    const tree = payload.lineItemTrees?.[treeId] || [];

                                    return (
                                        <PreviewLineItem key={idx} item={item} tree={tree} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Conditional Inputs for Add Items Task */}
                    {isAddItemsTask && (
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Additional Details Required</h4>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                                        <MapPin size={12} className="text-red-500" />
                                        Inspection Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="inspection-location"
                                        name="inspection-location"
                                        placeholder='Enter location'
                                        className="w-full h-10 p-3 text-xs font-medium rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all dark:text-slate-300 dark:placeholder-slate-500"
                                        value={inspectionLocation}
                                        onChange={(e) => setInspectionLocation(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                                        <AlignLeft size={12} className="text-indigo-400" />
                                        PO Remarks <span className="text-gray-400 font-medium">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={poRemarks}
                                        onChange={(e) => setPoRemarks(e.target.value)}
                                        placeholder="Enter any additional remarks..."
                                        className="w-full h-20 p-3 text-xs font-medium rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all dark:text-slate-300 dark:placeholder-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <CheckCircle size={16} />
                        Confirm & Submit
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PreviewModal;
