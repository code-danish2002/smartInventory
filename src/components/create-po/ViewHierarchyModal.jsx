import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronDown,
    Package,
    Layers,
    Info,
    AlertCircle,
    Loader2,
    Clock,
    Edit
} from 'lucide-react';
import api from '../../api/apiCall.js';
import { useTheme } from '../../context/themeContext.jsx';
import MainModal from '../../modals/parentModal';
import ProjectNumberEdit from '../../modals/projectEditForm.jsx';

// Recursive component for rendering hierarchy nodes
const HierarchyNode = ({ node, level = 0, onViewHistory, onEditProject }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1); // Expand first level by default
    const hasChildren = node.children && node.children.length > 0;
    const hasItems = node.item_details && node.item_details.length > 0;

    return (
        <div className={`flex flex-col border-l-2 ${level === 0 ? 'border-blue-500/30' : 'border-gray-200 dark:border-slate-700'} ml-4 my-2`}>
            <div
                className={`flex items-center gap-3 p-3 rounded-r-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50/50 dark:bg-slate-800/30' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-center w-6 h-6">
                    {(hasChildren || hasItems) ? (
                        isExpanded ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronRight size={18} className="text-gray-500" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-600" />
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 flex-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {node.sub_item_number}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">
                        {node.sub_item_description}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
                        <Package size={14} />
                        <span>{node.sub_item_quantity} {node.sub_item_unit_of_measurement}</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {/* Render nested item details table */}
                        {hasItems && (
                            <div className="ml-8 mr-4 mb-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 uppercase text-[10px] tracking-wider font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Make</th>
                                            <th className="px-4 py-3">Model</th>
                                            <th className="px-4 py-3 min-w-[150px]">Part Code</th>
                                            <th className="px-4 py-3 min-w-[150px]">Serial Number</th>
                                            <th className="px-4 py-3">Project No</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3 min-w-[200px]">Remarks</th>
                                            <th className="px-4 py-3 min-w-[150px]">Status</th>
                                            <th className="px-4 py-3 text-center min-w-[120px]">History</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                                        {node.item_details.map((item, idx) => (
                                            <tr key={item.po_item_details_id || idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{item.item_type_name}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.item_make_name}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.item_model_name}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400 min-w-[150px]">{item.item_part_code}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold min-w-[150px] wrap-break-word">{Array.isArray(item.item_serial_number) ? item.item_serial_number.join(', ') : item.item_serial_number || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <span>{item.item_project_number || item.project_number || '---'}</span>
                                                        {item.po_item_details_id && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEditProject && onEditProject([item.po_item_details_id]);
                                                                }}
                                                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
                                                                title="Edit Project Number"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.item_location || '---'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-slate-400 min-w-[150px] wrap-break-word">{item.remarks || item.item_remarks || '---'}</td>
                                                <td className="px-4 py-3 min-w-[150px]">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.item_status?.toLowerCase().includes('progress') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        item.item_status?.toLowerCase().includes('initiated') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        }`}>
                                                        {item.item_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center min-w-[120px]">
                                                    <button
                                                        onClick={() => onViewHistory && onViewHistory(item)}
                                                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Clock size={12} />
                                                        View History
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Render children nodes */}
                        {hasChildren && node.children.map((child, idx) => (
                            <HierarchyNode key={idx} node={child} level={level + 1} onViewHistory={onViewHistory} onEditProject={onEditProject} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ViewHierarchyModal = ({ isOpen, onClose, po_line_items_id, lineItemName }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [type, setType] = useState(null);
    const [error, setError] = useState(null);
    const [historyModal, setHistoryModal] = useState({ isOpen: false, row: null });
    const [editProjectModal, setEditProjectModal] = useState({ isOpen: false, itemIds: [] });

    useEffect(() => {
        if (isOpen && po_line_items_id) {
            fetchData();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, po_line_items_id]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/line-items/${po_line_items_id}/hierarchy`);
            if (response.data.success) {
                setData(response.data.data);
                setType(response.data.type);
            } else {
                setError('Failed to fetch hierarchy data.');
            }
        } catch (err) {
            console.error('Error fetching hierarchy:', err);
            setError(err.response?.data?.message || 'An error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Item Details
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                {lineItemName || ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-all active:scale-95"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                            <p className="text-gray-500 dark:text-slate-400 font-medium">Fetching details...</p>
                        </div>
                    ) : error ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Data</h3>
                                <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto">{error}</p>
                            </div>
                            <button
                                onClick={fetchData}
                                className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : data && data.length > 0 ? (
                        <div className="space-y-4">
                            {type === 'hierarchy' ? (
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-2">
                                    {/* <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-900/30">
                                        <Info size={16} />
                                        <span>Displaying nested hierarchy for items and sub-items</span>
                                    </div> */}
                                    {data.map((node, idx) => (
                                        <HierarchyNode key={idx} node={node} onViewHistory={(row) => setHistoryModal({ isOpen: true, row })} onEditProject={(ids) => setEditProjectModal({ isOpen: true, itemIds: ids })} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-2 px-6 py-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold border-b border-gray-200 dark:border-slate-800">
                                        <Package size={18} />
                                        <span>Item(s)</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 uppercase text-[10px] tracking-wider font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Make</th>
                                                    <th className="px-6 py-4">Model</th>
                                                    <th className="px-6 py-4 min-w-[150px]">Part Code</th>
                                                    <th className="px-6 py-4 min-w-[150px]">Serial Number</th>
                                                    <th className="px-6 py-4">Project No</th>
                                                    <th className="px-6 py-4">Location</th>
                                                    <th className="px-6 py-4 min-w-[200px]">Remarks</th>
                                                    <th className="px-6 py-4 min-w-[150px]">Status</th>
                                                    <th className="px-6 py-4 text-center min-w-[120px]">History</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                                                {data.map((item, idx) => (
                                                    <tr key={item.po_item_details_id || idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">{item.item_type_name}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{item.item_make_name}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{item.item_model_name}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400 min-w-[150px]">{item.item_part_code}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold min-w-[150px] wrap-break-word">{Array.isArray(item.item_serial_number) ? item.item_serial_number.join(', ') : item.item_serial_number || '---'}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <span>{item.item_project_number || item.project_number || '---'}</span>
                                                                {item.po_item_details_id && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditProjectModal({ isOpen: true, itemIds: [item.po_item_details_id] });
                                                                        }}
                                                                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-blue-500 transition-colors"
                                                                        title="Edit Project Number"
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{item.item_location || '---'}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400 min-w-[200px] wrap-break-word">{item.remarks || item.item_remarks || '---'}</td>
                                                        <td className="px-6 py-4 min-w-[150px]">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.item_status?.toLowerCase().includes('progress') ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                item.item_status?.toLowerCase().includes('initiated') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                }`}>
                                                                {item.item_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center min-w-[120px]">
                                                            <button
                                                                onClick={() => setHistoryModal({ isOpen: true, row: item })}
                                                                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all inline-flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/30 shadow-sm shadow-indigo-500/10 active:scale-95 cursor-pointer"
                                                            >
                                                                <Clock size={14} />
                                                                History
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-400">
                                <Package size={40} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Items Found</h3>
                                <p className="text-gray-500 dark:text-slate-400">There are no hierarchy details documented for this line item.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl font-bold transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </motion.div>

            {/* Serial History Modal via MainModal */}
            {historyModal.isOpen && (
                <MainModal
                    isOpen={historyModal.isOpen}
                    onClose={() => setHistoryModal({ isOpen: false, row: null })}
                    modalName="Track History"
                    type="view-status"
                    data={{ params: historyModal.row }}
                />
            )}

            {editProjectModal.isOpen && (
                <ProjectNumberEdit
                    isOpen={editProjectModal.isOpen}
                    onClose={() => setEditProjectModal({ isOpen: false, itemIds: [] })}
                    onSubmit={() => {
                        fetchData();
                        setEditProjectModal({ isOpen: false, itemIds: [] });
                    }}
                    selectedItems={editProjectModal.itemIds}
                />
            )}
        </div>
    );
};

export default ViewHierarchyModal;
