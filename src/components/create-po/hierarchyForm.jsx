import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, Package, Info, Hash } from 'lucide-react';
import FloatingInput from '../../formElements/floatingInputBox.jsx';
import FloatingSelect from '../../formElements/floatingSelectBox.jsx';
import api from '../../api/apiCall.js';
import CreatableSelect from 'react-select/creatable';
import { unitOptions } from '../../utils/constants.js';

// ---------------------------------------------------------------------------
// Master Data Cache
// ---------------------------------------------------------------------------
const masterDataCache = {
    type: {},
    make: {},
    model: {},
    part: {}
};

const fetchMasterData = (cacheGrp, key, url, mapper) => {
    if (cacheGrp[key]?.data) {
        return Promise.resolve(cacheGrp[key].data);
    }
    if (cacheGrp[key]?.promise) {
        return cacheGrp[key].promise;
    }

    const promise = api.get(url)
        .then(r => {
            const opts = r.data.data.map(mapper);
            cacheGrp[key] = { data: opts, promise: null };
            return opts;
        })
        .catch(err => {
            cacheGrp[key] = { data: null, promise: null };
            throw err;
        });

    cacheGrp[key] = { data: null, promise };
    return promise;
};

// ---------------------------------------------------------------------------
// ItemNodeFields – handles cascading selects (Type → Make → Model) per item
// ---------------------------------------------------------------------------
const ItemNodeFields = ({ item, lineItemId, onUpdate, disabled }) => {
    const [typeOptions, setTypeOptions] = useState([]);
    const [makeOptions, setMakeOptions] = useState([]);
    const [modelOptions, setModelOptions] = useState([]);
    const [partOptions, setPartOptions] = useState([]);
    const [loading, setLoading] = useState({ type: true, make: false, model: false, part: false });

    // Load item types once on mount
    useEffect(() => {
        setLoading(prev => ({ ...prev, type: true }));
        fetchMasterData(masterDataCache.type, 'all', '/api/item-type', i => ({ value: i.item_type_id, label: i.item_type_name }))
            .then(setTypeOptions)
            .catch(console.error)
            .finally(() => setLoading(prev => ({ ...prev, type: false })));
    }, []);

    // Load makes when type changes
    useEffect(() => {
        if (!item.item_type_id) {
            setMakeOptions([]);
            setModelOptions([]);
            setPartOptions([]);
            return;
        }
        setLoading(prev => ({ ...prev, make: true, model: false, part: false }));
        setMakeOptions([]);
        setModelOptions([]);
        setPartOptions([]);
        fetchMasterData(masterDataCache.make, item.item_type_id, `/api/item-makes/by-type/${item.item_type_id}`, i => ({ value: i.item_make_id, label: i.item_make_name }))
            .then(setMakeOptions)
            .catch(console.error)
            .finally(() => setLoading(prev => ({ ...prev, make: false })));
    }, [item.item_type_id]);

    // Load models when make changes
    useEffect(() => {
        if (!item.item_make_id) {
            setModelOptions([]);
            setPartOptions([]);
            return;
        }
        setLoading(prev => ({ ...prev, model: true, part: false }));
        setModelOptions([]);
        setPartOptions([]);
        fetchMasterData(masterDataCache.model, item.item_make_id, `/api/item-models/by-make/${item.item_make_id}`, i => ({ value: i.item_model_id, label: i.item_model_name }))
            .then(setModelOptions)
            .catch(console.error)
            .finally(() => setLoading(prev => ({ ...prev, model: false })));
    }, [item.item_make_id]);

    // Load parts when model changes
    useEffect(() => {
        if (!item.item_model_id) {
            setPartOptions([]);
            return;
        }
        setLoading(prev => ({ ...prev, part: true }));
        setPartOptions([]);
        fetchMasterData(masterDataCache.part, item.item_model_id, `/api/item-parts/by-model/${item.item_model_id}`, i => ({ value: i.item_part_id, label: i.item_part_code }))
            .then(setPartOptions)
            .catch(console.error)
            .finally(() => setLoading(prev => ({ ...prev, part: false })));
    }, [item.item_model_id]);

    const handleTypeChange = (e) => {
        const value = e.target.value;
        const label = typeOptions.find(o => String(o.value) === String(value))?.label || '';
        onUpdate(lineItemId, item.id, 'item_type_id', value);
        onUpdate(lineItemId, item.id, 'item_type_name', label);
        onUpdate(lineItemId, item.id, 'item_make_id', '');
        onUpdate(lineItemId, item.id, 'item_make_name', '');
        onUpdate(lineItemId, item.id, 'item_model_id', '');
        onUpdate(lineItemId, item.id, 'item_model_name', '');
        onUpdate(lineItemId, item.id, 'item_part_id', '');
        onUpdate(lineItemId, item.id, 'item_part_code', '');
    };

    const handleMakeChange = (e) => {
        const value = e.target.value;
        const label = makeOptions.find(o => String(o.value) === String(value))?.label || '';
        onUpdate(lineItemId, item.id, 'item_make_id', value);
        onUpdate(lineItemId, item.id, 'item_make_name', label);
        onUpdate(lineItemId, item.id, 'item_model_id', '');
        onUpdate(lineItemId, item.id, 'item_model_name', '');
        onUpdate(lineItemId, item.id, 'item_part_id', '');
        onUpdate(lineItemId, item.id, 'item_part_code', '');
    };

    const handleModelChange = (e) => {
        const value = e.target.value;
        const label = modelOptions.find(o => String(o.value) === String(value))?.label || '';
        onUpdate(lineItemId, item.id, 'item_model_id', value);
        onUpdate(lineItemId, item.id, 'item_model_name', label);
        onUpdate(lineItemId, item.id, 'item_part_id', '');
        onUpdate(lineItemId, item.id, 'item_part_code', '');
    };

    const handlePartChange = (e) => {
        const value = e.target.value;
        const label = partOptions.find(o => String(o.value) === String(value))?.label || '';
        onUpdate(lineItemId, item.id, 'item_part_id', value);
        onUpdate(lineItemId, item.id, 'item_part_code', label);
    };

    return (
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FloatingSelect
                id={`type-${item.id}`}
                label={loading.type ? 'Loading Types…' : 'Item Type'}
                options={typeOptions}
                value={item.item_type_id || ''}
                onChange={handleTypeChange}
                disabled={disabled || loading.type}
            />
            <FloatingSelect
                id={`make-${item.id}`}
                label={loading.make ? 'Loading Makes…' : 'Item Make'}
                options={makeOptions}
                value={item.item_make_id || ''}
                onChange={handleMakeChange}
                disabled={disabled || loading.make || !item.item_type_id}
            />
            <FloatingSelect
                id={`model-${item.id}`}
                label={loading.model ? 'Loading Models…' : 'Item Model'}
                options={modelOptions}
                value={item.item_model_id || ''}
                onChange={handleModelChange}
                disabled={disabled || loading.model || !item.item_make_id}
            />
            <FloatingSelect
                id={`part-${item.id}`}
                label={loading.part ? 'Loading Parts…' : 'Item Part'}
                options={partOptions}
                value={item.item_part_id || ''}
                onChange={handlePartChange}
                disabled={disabled || loading.part || !item.item_model_id}
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// LevelNodeFields – FloatingInput for description + unit (no quantity)
// ---------------------------------------------------------------------------
const LevelNodeFields = ({ item, lineItemId, onUpdate, disabled }) => {

    return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FloatingInput
                id={`desc-${item.id}`}
                label="Description"
                value={item.description || ''}
                onChange={(e) => onUpdate(lineItemId, item.id, 'description', e.target.value)}
                disabled={disabled}
            />
            <FloatingInput
                id={`qty-${item.id}`}
                label="Quantity"
                type="number"
                value={item.quantity || ''}
                onChange={(e) => onUpdate(lineItemId, item.id, 'quantity', e.target.value)}
                disabled={disabled}
            />
            <FloatingSelect
                id={`unit-${item.id}`}
                label="Unit"
                options={unitOptions}
                value={item.unit || ''}
                onChange={(e) => onUpdate(lineItemId, item.id, 'unit', e.target.value)}
                disabled={disabled}
            />
        </div>
    );
};

// ---------------------------------------------------------------------------
// TreeNode – renders a single hierarchy node (level or item)
// ---------------------------------------------------------------------------
const TreeNode = ({ item, lineItemId, onAdd, onUpdate, onDelete, onOpenSerials, task }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const isLevel = item.type === 'level';
    const isUpdateMode = task === 'Update Inspection' || task === 'Add Item Details';

    return (
        <div className="relative ml-6 mt-4">
            {/* Connector lines */}
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="absolute -left-4 top-5 w-4 h-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-3 group">
                {/* Prefix badge */}
                <div className="min-w-[40px] flex items-center justify-center shrink-0">
                    {isLevel ? (
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shadow-sm whitespace-nowrap">
                            {item.code}
                        </span>
                    ) : (
                        <Package size={16} className="text-emerald-500 dark:text-emerald-400" />
                    )}
                </div>

                {/* Expand toggle for levels */}
                {isLevel && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 shrink-0"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                )}

                {/* Fields */}
                {isLevel ? (
                    <LevelNodeFields item={item} lineItemId={lineItemId} onUpdate={onUpdate} disabled={task !== 'Create Inspection'} />
                ) : (
                    <ItemNodeFields item={item} lineItemId={lineItemId} onUpdate={onUpdate} disabled={task !== 'Create Inspection'} />
                )}

                {/* S.No Button for Update Mode */}
                {!isLevel && isUpdateMode && (
                    <button
                        onClick={() => {
                            // The maxQty should be the quantity_offered of the parent line item
                            // This is handled in po_initiate_form_modal.jsx's handleOpenSerials
                            onOpenSerials(lineItemId, item.id, item.item_serial_number, item.remarks, item.allowDuplicates);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all shrink-0"
                    >
                        <Hash size={12} />
                        S.No({item.item_serial_number?.length || 0})
                    </button>
                )}

                {/* Actions - Only visible in Create Inspection */}
                {task === 'Create Inspection' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {isLevel && (
                            <>
                                {!(item.subItems || []).some(child => child.type === 'item') && (
                                    <button
                                        onClick={() => onAdd && onAdd(lineItemId, item.id, 'level')}
                                        className="text-[9px] px-2 py-1 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 font-black uppercase tracking-tighter transition-colors"
                                    >
                                        + Level
                                    </button>
                                )}
                                {!(item.subItems || []).some(child => child.type === 'level') && (
                                    <button
                                        onClick={() => onAdd && onAdd(lineItemId, item.id, 'item')}
                                        className="text-[9px] px-2 py-1 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 font-black uppercase tracking-tighter transition-colors"
                                    >
                                        + Item
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            onClick={() => onDelete && onDelete(lineItemId, item.id)}
                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Recursive children */}
            {isExpanded && item.subItems && item.subItems.length > 0 && (
                <div className="mt-1">
                    {item.subItems.map(child => (
                        <TreeNode
                            key={child.id}
                            item={child}
                            lineItemId={lineItemId}
                            onAdd={onAdd}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onOpenSerials={onOpenSerials}
                            task={task}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// HierarchyForm – the outer accordion per line-item
// ---------------------------------------------------------------------------
const HierarchyForm = ({
    lineItems = [],
    lineItemTrees = {},
    selectedIds = [],
    onSelectionChange,
    onLineItemQtyChange,
    onAddTopLevel,
    onAddSubItem,
    onUpdateTree,
    onDeleteTree,
    onOpenSerials,
    onViewMore,
    task
}) => {
    // Expand/Collapse state (Keep local as it's UI only)
    const [expandedLines, setExpandedLines] = useState({});

    const toggleExpand = (summaryId) => {
        setExpandedLines(prev => ({ ...prev, [summaryId]: !prev[summaryId] }));
    };

    return (
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8">
            <div className="max-w-full mx-auto space-y-6">
                {lineItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="inline-flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">
                            <Package size={48} className="text-amber-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Line Items Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
                            This Purchase Order doesn't appear to have any line items listed. Please verify the PO details or contact procurement if you believe this is an error.
                        </p>
                    </div>
                ) : (
                    lineItems.map((line) => {
                        const treeId = line.summary_id || line.po_line_item_id;
                        const tree = lineItemTrees[treeId] || [];
                        const rootType = tree.length > 0 ? tree[0].type : null;
                        const isExpanded = expandedLines[treeId];
                        const isSelected = selectedIds.includes(treeId);
                        const isCreateMode = task === 'Create Inspection';

                        return (
                            <div
                                key={treeId}
                                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
                            >
                                {/* Line Item Header */}
                                <div
                                    className={`px-4 py-3 flex justify-between items-center transition-colors ${isSelected
                                        ? 'bg-indigo-600 dark:bg-indigo-900 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => isCreateMode && onSelectionChange && onSelectionChange(treeId)}
                                            disabled={!isCreateMode}
                                            className={`w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 ${isCreateMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                                        />
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                Line {line.line_number}
                                            </span>
                                            <span className="text-sm font-bold truncate" title={`${line.line_description || line.line_item_name} - ${line.item_description || line.description}`}>{`${line.line_description || line.line_item_name} - ${line.item_description || line.description}`}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Conditional Qty Off vs Warranty Start */}
                                        {isCreateMode && (
                                            <div className="flex items-center gap-1.5 mr-1">
                                                <label className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-indigo-100/70' : 'text-slate-400'}`}>Qty Off.</label>
                                                <input
                                                    type="number"
                                                    value={line.quantity_offered ?? ''}
                                                    min={0}
                                                    onChange={(e) => onLineItemQtyChange && onLineItemQtyChange(treeId, e.target.value)}
                                                    placeholder="0"
                                                    className={`w-14 h-7 text-center text-xs font-bold rounded-md border transition-all focus:outline-none focus:ring-1 ${isSelected
                                                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-white/50 hover:bg-white/20'
                                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 hover:border-slate-400'
                                                        }`}
                                                />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => onViewMore && onViewMore(line)}
                                            className={`p-1.5 rounded-md transition-all duration-300 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                                            title="View Line Details"
                                        >
                                            <Info size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleExpand(treeId)}
                                            className={`p-1.5 rounded-md transition-all duration-300 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'} ${isExpanded ? 'rotate-180' : ''}`}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Collapsible Body */}
                                {isExpanded && (
                                    <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                                        {tree.length === 0 && (
                                            <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-600">
                                                No hierarchy items added yet. Start by adding a Level or a direct Item.
                                            </div>
                                        )}

                                        {tree.map(node => (
                                            <TreeNode
                                                key={node.id}
                                                item={node}
                                                lineItemId={treeId}
                                                onAdd={onAddSubItem}
                                                onUpdate={onUpdateTree}
                                                onDelete={onDeleteTree}
                                                onOpenSerials={onOpenSerials}
                                                task={task}
                                            />
                                        ))}

                                        {/* Root-level add buttons - Only visible in Create Inspection */}
                                        {task === 'Create Inspection' && (
                                            <div className="mt-8 flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                                <button
                                                    disabled={rootType === 'item'}
                                                    onClick={() => onAddTopLevel(treeId, line.line_number, 'level')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all ${rootType === 'item'
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none'
                                                        }`}
                                                >
                                                    <Plus size={16} /> Add Level
                                                </button>
                                                <button
                                                    disabled={rootType === 'level'}
                                                    onClick={() => onAddTopLevel(treeId, line.line_number, 'item')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all ${rootType === 'level'
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none'
                                                        }`}
                                                >
                                                    <Plus size={16} /> Add Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default HierarchyForm;