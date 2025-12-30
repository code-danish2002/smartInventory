import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, Package, Plus, MapPin, User, Send, X, Clipboard, Edit, Save, Trash2, List, Loader2, Users, PlusCircle, Filter } from 'lucide-react';
import ItemDispatchCard from './itemsCard';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import api from '../../api/apiCall';
import { commonSelectProps } from '../../utils/CommonCSS';
import { LuSettings } from "react-icons/lu";
import { set } from 'react-hook-form';
import ReactModal from 'react-modal';
import ItemDispatchForm from './dispatchForm';

const LineItemCard = ({
    lineItem,
    onUpdateItemDetails,
    availableQuantity,
    dispatches,
    editingDispatchId,
    setEditingDispatchId,
    isAddingNew,
    setIsAddingNew,
    handleSaveDispatch,
    handleDeleteDispatch,
    phaseName,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [groupBy, setGroupBy] = useState(null); // 'make', 'model', or null
    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState([]);
    const options = useRef({ make: new Set(), model: new Set(), part: new Set(), project: new Set() });

    const itemClusters = useMemo(() => {
        options.current = { make: new Set(), model: new Set(), part: new Set(), project: new Set() };
        // 1. CLUSTER: Group all po_item_details based on the five criteria
        const clusteredItems = lineItem.po_item_details.reduce((acc, item) => {
            //using loop for options
            options.current.make.add(item.item_make_name);
            options.current.model.add(item.item_model_name);
            options.current.part.add(item.item_part_code);
            options.current.project.add(item.project_number);
            // Define the key for clustering (must be unique for each combination)
            const clusterKey = [
                item.item_type_name,
                item.item_make_name,
                item.item_model_name,
                item.item_part_code,
                item.project_number
            ].join('|@|'); // Use a separator unlikely to appear in data

            if (!acc[clusterKey]) {
                acc[clusterKey] = {
                    ...item,
                    clusterDetails: [],
                    isClustered: true,
                    clusterKey: clusterKey,
                };
            }
            // Push the original item details into the cluster
            acc[clusterKey].clusterDetails.push(item);
            acc[clusterKey].totalClusterCount = acc[clusterKey].clusterDetails.length;

            return acc;
        }, {});
        let clusteredArray = Object.values(clusteredItems);
        if (filters.length > 0) {
            clusteredArray = clusteredArray.filter(cluster => {
                // A cluster passes the filter if it matches AT LEAST ONE filter row (OR logic between rows)
                return filters.some(filterRow => {
                    // Check if the cluster matches ALL non-null criteria in the filter row (AND logic within a row)
                    const makeMatch = !filterRow.make || cluster.item_make_name === filterRow.make.value;
                    const modelMatch = !filterRow.model || cluster.item_model_name === filterRow.model.value;
                    const partMatch = !filterRow.part || cluster.item_part_code === filterRow.part.value;
                    const projectMatch = !filterRow.project || cluster.project_number === filterRow.project.value;

                    // The filter row is only active if at least one field is selected
                    const isFilterActive = filterRow.make || filterRow.model || filterRow.part || filterRow.project;

                    return isFilterActive && makeMatch && modelMatch && partMatch && projectMatch;
                });
            });
        }

        return clusteredArray;
    }, [lineItem.po_item_details, filters]);
    const totalDispatched = useMemo(() =>
        dispatches.reduce((sum, d) => sum + d.quantity, 0),
        [dispatches]
    );

    const dispatchedSerialNumbers = useMemo(() => {
        return dispatches.reduce((acc, dispatch) => {
            // FIX: Use assignedSerials property
            const serialNumbers = dispatch.assignedSerials || [];

            if (serialNumbers.length > 0) {
                // The value/po_item_details_id is what we need to track
                acc.push(...serialNumbers.map(sn => sn.value));
            }
            return acc;
        }, []);
    }, [dispatches]);

    const availableSerialNumbers = useMemo(() => {
        const allInspectedItems = lineItem.po_item_details.filter(item => item.quantity_inspected > 0);

        // Get the dispatch being edited, if any
        const editingDispatch = dispatches.find(d => d.id === editingDispatchId);

        // FIX: Safely get the SN IDs of the item being edited using assignedSerials
        const editingSNIds = editingDispatch?.assignedSerials?.map(sn => sn.value) || [];

        return allInspectedItems
            .filter(item => {
                const isDispatched = dispatchedSerialNumbers.includes(item.po_item_details_id);

                // An item is available if it's NOT dispatched, 
                // OR if its SN ID is one of the SNs in the dispatch currently being EDITED.
                const isCurrentEditItem = editingSNIds.includes(item.po_item_details_id);

                return !isDispatched || isCurrentEditItem;
            })
            .map(item => ({
                po_item_details_id: item.po_item_details_id,
                item_serial_number: item.item_serial_number,
                value: item.po_item_details_id,
                label: item.item_serial_number
            }));
    }, [lineItem.po_item_details, dispatchedSerialNumbers, editingDispatchId, dispatches]);

    const Icon = isExpanded ? ChevronUp : ChevronDown;

    const renderGroupingText = (group) => {
        const totalInGroup = group.items.reduce((sum, item) => sum + item.quantity_inspected, 0);
        if (groupBy === 'make') {
            return `Grouped by Make: ${group.key} (${totalInGroup} Total Items)`;
        }
        if (groupBy === 'model') {
            return `Grouped by Model: ${group.key} (${totalInGroup} Total Items)`;
        }
        if (groupBy === 'make-model') {
            return `Grouped by Make & Model: ${group.key} (${totalInGroup} Total Items)`;
        }
        return 'Item Details';
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-6 transition-all duration-300">
            {/* Header / Collapse Trigger */}
            <div
                className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition duration-200 border-b border-gray-200"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-4">
                    <Package className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-800">
                            {lineItem.line_number}: {lineItem.line_item_name}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Status: <span className={`font-semibold ${lineItem.po_line_item_status === 'In process' ? 'text-yellow-600' : 'text-green-600'}`}>{lineItem.po_line_item_status}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className='hidden sm:block'>
                        <span className="font-semibold text-green-600">({availableQuantity} out of {lineItem.po_item_details.length}) left   </span>
                    </div>
                    <LuSettings className="w-6 h-6 text-gray-500 hover:text-gray-600" onClick={(e) => {
                        e.stopPropagation(); // ⛔ prevent triggering parent expand
                        console.log('Settings Clicked'); // 👉 your own action
                        setOpenFilters(true);
                    }} />
                    <Icon className="w-6 h-6 text-gray-500" />
                </div>
            </div>

            {/* Collapsible Content */}
            <div className={`p-5 pt-0 ${isExpanded ? 'max-h-[calc(100vh-300px)] opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto overflow-x-hidden transition-all duration-500`}>
                {/* Add New Dispatch Form at top */}
                {isAddingNew && (
                    <ItemDispatchForm
                        lineItem={lineItem}
                        onSave={handleSaveDispatch}
                        onCancel={() => setIsAddingNew(null)}
                        availableQuantity={availableQuantity}
                        availableSerialNumbers={availableSerialNumbers}
                        phaseName={phaseName}
                    />
                )}

                {/* Existing Dispatches Section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-3 mt-1">
                        <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                            <Send className="w-5 h-5 mr-2 text-blue-500" /> Current Dispatches
                        </h4>
                        {!isAddingNew && availableQuantity > 0 && editingDispatchId === null && (<button
                            onClick={() => setIsAddingNew(true)}
                            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition duration-300 ${availableQuantity > 0 && editingDispatchId === null
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={availableQuantity <= 0 || editingDispatchId !== null}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Dispatch Request
                        </button>)}
                    </div>

                    {dispatches.length === 0 ? (
                        <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg border">No dispatch requests added yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {dispatches.map(dispatch => (
                                <div key={dispatch.id}>
                                    {editingDispatchId === dispatch.id ? (
                                        <ItemDispatchForm
                                            lineItem={lineItem}
                                            initialDispatch={dispatch}
                                            onSave={handleSaveDispatch}
                                            onCancel={() => setEditingDispatchId(null)}
                                            availableQuantity={availableQuantity}
                                            availableSerialNumbers={availableSerialNumbers}
                                            phaseName={phaseName}
                                        />
                                    ) : (
                                        <div className="flex items-center p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
                                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <div className="flex items-center text-blue-800 font-bold"><List className="w-4 h-4 mr-1" /> {dispatch.quantity} Pcs</div>
                                                <div className="flex items-center text-gray-600"><Package className="w-4 h-4 mr-1" /> {dispatch.phase}</div>
                                                <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-1" /> {dispatch.location?.label}</div>
                                                <div className="flex items-center text-gray-600"><User className="w-4 h-4 mr-1" /> {dispatch.owner?.label}</div>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => setEditingDispatchId(dispatch.id)}
                                                    className="p-1.5 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                                                    title="Edit Dispatch"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDispatch(dispatch.id)}
                                                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                                                    title="Delete Dispatch"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full mt-4 pb-4 border-b border-gray-100 flex items-center">
                    <span className='text-sm text-center text-gray-600 mr-2'>
                        {filters.length > 0
                            && `Filters Applied: ${filters.length} criteria active`
                        }
                    </span>
                </div>

                {/* Item List (Filtered Clusters) */}
                <div className="mt-6 border border-dashed border-gray-300 p-4 rounded-xl bg-gray-50">
                    {itemClusters.length === 0 && filters.length > 0 ? (
                        <p className="text-sm text-center text-red-500 italic mt-4 p-2 bg-yellow-50 rounded-lg">
                            No items match the current filter criteria.
                        </p>
                    ) : itemClusters.map(itemDetails => (
                        <div key={itemDetails.clusterKey || itemDetails.po_item_details_id} className="mt-4 first:mt-0">
                            <ItemDispatchCard
                                itemDetails={itemDetails}
                            />
                        </div>
                    ))}
                </div>

                {availableQuantity === 0 && (
                    <p className="text-sm text-center text-red-500 italic mt-4 p-2 bg-red-50 rounded-lg">
                        All {lineItem.po_item_details.length} items have been queued for dispatch.
                    </p>
                )}
            </div>
            {openFilters && (
                <ItemsFilter
                    isOpen={openFilters}
                    onClose={() => setOpenFilters(false)}
                    availableFilterOptions={options.current}
                    selectedFilters={filters}
                    onApply={setFilters}
                />
            )}
        </div>
    );
};

export default LineItemCard;

//make a component of mfilter modal based on make modal, and part and use it in line item card

if (typeof document !== 'undefined') {
    ReactModal.setAppElement('#root'); // Update '#root' to your main app element selector
}

// Helper to generate a unique ID for filter rows
const generateId = () => Date.now() + Math.random();


const ItemsFilter = ({
    isOpen,
    onClose,
    availableFilterOptions, // Dynamic options (Make, Model, etc.) from lineItem data
    selectedFilters, // Array of filter objects currently applied
    onApply, // Function to apply the filters to the parent component state
}) => {
    const formatOptions = (set) => Array.from(set).map(val => ({ value: val, label: val }));
    const makeOptions = formatOptions(availableFilterOptions.make);
    const modelOptions = formatOptions(availableFilterOptions.model);
    const partOptions = formatOptions(availableFilterOptions.part);
    const projectOptions = formatOptions(availableFilterOptions.project);

    const [localSelectedFilters, setLocalSelectedFilters] = useState(selectedFilters.length > 0 ? selectedFilters : [{ id: generateId(), make: null, model: null, part: null, project: null }]);

    // Sync external changes (e.g., initial load)
    useEffect(() => {
        setLocalSelectedFilters(selectedFilters || []);
    }, [selectedFilters]);

    const addFilterRow = () => {
        setLocalSelectedFilters(prev => [
            ...prev,
            {
                id: generateId(),
                make: null,
                model: null,
                part: null,
                project: null,
            }
        ]);
    };

    const removeFilterRow = (id) => {
        console.log('Removing filter row with id:', id);
        setLocalSelectedFilters(prev => prev.filter(row => row.id !== id));
    };

    const updateFilterRow = (id, key, newValue) => {
        setLocalSelectedFilters(prev =>
            prev.map(row => (row.id === id ? { ...row, [key]: newValue } : row))
        );
    };

    const handleApply = () => {
        // Filter out incomplete rows
        const validFilters = localSelectedFilters.filter(f => f.make || f.model || f.part || f.project);
        onApply(validFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalSelectedFilters([{ id: generateId(), make: null, model: null, part: null, project: null }]);
        onApply([]);
        onClose();
    };

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
            contentLabel="Item Filters"
        >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" /> Apply Item Filters
                </h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="space-y-4">
                {localSelectedFilters.map((row, index) => (
                    <div
                        key={row.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 border border-gray-200 p-3 rounded-md bg-white"
                    >
                        {/* Make Select */}
                        <div className="flex-1 min-w-[100px]">
                            <Select
                                className="w-full text-xs font-semibold"
                                styles={{ ...commonSelectProps, control: (base) => ({ ...base, minWidth: '100px' }) }}
                                options={makeOptions}
                                value={row.make} // Connect to row state
                                onChange={(selected) => updateFilterRow(row.id, 'make', selected)} // Update row state
                                placeholder="Select Make"
                                isClearable
                            />
                        </div>

                        {/* Model Select */}
                        <div className="flex-1 min-w-[100px]">
                            <Select
                                className="w-full text-xs font-semibold"
                                styles={{ ...commonSelectProps, control: (base) => ({ ...base, minWidth: '100px' }) }}
                                options={modelOptions}
                                value={row.model}
                                onChange={(selected) => updateFilterRow(row.id, 'model', selected)}
                                placeholder="Select Model"
                                isClearable
                            />
                        </div>

                        {/* Part Select */}
                        <div className="flex-1 min-w-[100px]">
                            <Select
                                className="w-full text-xs font-semibold"
                                styles={{ ...commonSelectProps, control: (base) => ({ ...base, minWidth: '100px' }) }}
                                options={partOptions}
                                value={row.part}
                                onChange={(selected) => updateFilterRow(row.id, 'part', selected)}
                                placeholder="Select Part"
                                isClearable
                            />
                        </div>

                        {/* Project Select */}
                        <div className="flex-1 min-w-[100px]">
                            <Select
                                className="w-full text-xs font-semibold"
                                styles={{ ...commonSelectProps, control: (base) => ({ ...base, minWidth: '100px' }) }}
                                options={projectOptions}
                                value={row.project}
                                onChange={(selected) => updateFilterRow(row.id, 'project', selected)}
                                placeholder="Select Project"
                                isClearable
                            />
                        </div>

                        {/* Remove Button (Only show if more than one filter row exists) */}
                        <button
                            onClick={() => removeFilterRow(row.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors self-center sm:self-auto"
                            title={localSelectedFilters.length === 1 ? "At least one filter row is required" : "Remove this filter row"}
                        //disabled={localSelectedFilters.length === 1}
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addFilterRow}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-md transition-colors"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>Add Filter Row</span>
                </button>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Clear All
                </button>
                <button
                    onClick={handleApply}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </ReactModal>
    );
};