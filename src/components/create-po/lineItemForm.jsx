import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DeleteIcon, DownArrow, Edit, OnSubmitLoading, RoundAddCircle } from '../../utils/icons.jsx';
import ItemsForm from './itemsForm.jsx';
import CreatableSelect from 'react-select/creatable';

const LineItemForm = ({ po, defaultValues, onSubmit, onCancel, loading, task, existingSerialNumbers }) => {
    const [lineItem, setLineItem] = useState([]);
    const [digitalSignature, setDigitalSignature] = React.useState('Physically_Sign');
    const [expandedLineItemIds, setExpandedLineItemIds] = React.useState([]);
    const [selectedLineItemIdForAdd, setSelectedLineItemIdForAdd] = React.useState(null);
    const [editingSubItem, setEditingSubItem] = React.useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const tableContainerRef = useRef(null);
    const isCreate = task === 'Create Inspection';
    const isAdd = task === 'Add Item Details';
    const isEdit = task === 'Edit Inspection';

    console.log('default values', defaultValues, 'lineItem', lineItem);

    const filteredLineItems = useMemo(() => {
        if (!searchTerm) return lineItem;
        const term = searchTerm.toLowerCase();
        return lineItem.filter(item =>
            (item.line_number && item.line_number.toLowerCase().includes(term)) ||
            (item.line_item_name && item.line_item_name.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    }, [lineItem, searchTerm]);

    useEffect(() => {
        if (!defaultValues || defaultValues.length === 0) {
            setLineItem([]);
            return;
        }

        setLineItem(defaultValues.map(li => ({
            po_line_item_id: li?.po_line_item_id || li?.erp_po_line_item_id || uuidv4(),
            isNew: false,
            selected: true,
            line_number: li.line_number || '',
            line_item_name: li.line_item_name || '',
            total_quantity: li.total_quantity || null,
            quantity_offered: li.quantity_offered || null,
            description: li.description || null,
            unit_measurement: li.unit_measurement || null,
            unit_price: li.unit_price || null,
            po_line_item_status: li?.po_line_item_status || null,
            phases: li?.phases || null,
            item_location: li?.item_location || null,
            warranty_start: li?.warranty_start || null,
            items: (li.po_item_details || []).map(d => ({
                po_line_item_id: d.po_item_details_id,
                po_item_details_id: d.po_item_details_id,
                item_type_id: d.item_type_id,
                item_make_id: d.item_make_id,
                item_model_id: d.item_model_id,
                item_part_id: d.item_part_id,
                item_type: d.item_type_name,
                item_make: d.item_make_name,
                item_model: d.item_model_name,
                item_part: d.item_part_code,
                description: d.item_part_description,
                quantity_inspected: d.quantity_inspected || null,
                item_serial_number: Array.isArray(d.item_serial_number)
                    ? d.item_serial_number
                    : [d.item_serial_number],
                remarks: d.remarks,
            })),
        })));
    }, [defaultValues]);

    const allExistingSerials = lineItem?.flatMap(li => li.items.flatMap(si => si.item_serial_number || []));

    const handleLineItemChange = (lineItemId, newValue, fieldName) => {
        // Ensure numeric-only input for the 3 fields
        if (['total_quantity', 'quantity_offered', 'quantity_inspected'].includes(fieldName)) {
            newValue = newValue.replace(/[^0-9]/g, '');
            newValue = newValue === '' ? '' : parseInt(newValue); // Convert to number or keep as empty string
        }

        if (fieldName === 'unit_price') {
            newValue = newValue.replace(/[^0-9.]/g, '');
            newValue = newValue === '' ? '' : parseFloat(newValue); // Convert to number or keep as empty string
        }

        if (fieldName === 'warranty_start') {
            if (newValue == null || newValue === '') {
                newValue = '';
            } else {
                let input = newValue.trim();

                // Allow special strings (case-insensitive)
                if (/^(PSI|PO Date)$/i.test(input)) {
                    newValue = input;
                } else {
                    // Keep only numbers and hyphens
                    input = input.replace(/[^0-9-]/g, '');

                    const dateFormat = /^(\d{4})-(\d{2})-(\d{2})$/;
                    if (dateFormat.test(input)) {
                        const [, year, month, day] = input.match(dateFormat);
                        const dateObj = new Date(`${year}-${month}-${day}`);

                        const isValid =
                            dateObj instanceof Date &&
                            !isNaN(dateObj) &&
                            dateObj.getDate() === parseInt(day, 10) &&
                            dateObj.getMonth() + 1 === parseInt(month, 10) &&
                            dateObj.getFullYear() === parseInt(year, 10);

                        newValue = isValid ? input : '';
                    } else {
                        newValue = '';
                    }
                }
            }
        }


        setLineItem(prev =>
            // Adjust values if they violate constraints
            prev.map(li => {
                if (li.po_line_item_id !== lineItemId) return li;

                const updatedLineItem = { ...li, [fieldName]: newValue };

                if (fieldName === 'total_quantity' && updatedLineItem.total_quantity < updatedLineItem.quantity_offered) {
                    updatedLineItem.quantity_offered = updatedLineItem.total_quantity;
                }

                if (fieldName === 'quantity_offered') {
                    if (updatedLineItem.quantity_offered > updatedLineItem.total_quantity) {
                        updatedLineItem.quantity_offered = updatedLineItem.total_quantity;
                    }
                    if (updatedLineItem.quantity_inspected > updatedLineItem.quantity_offered) {
                        updatedLineItem.quantity_inspected = updatedLineItem.quantity_offered;
                    }
                }

                if (fieldName === 'quantity_inspected') {
                    if (updatedLineItem.quantity_inspected > updatedLineItem.quantity_offered) {
                        updatedLineItem.quantity_inspected = updatedLineItem.quantity_offered;
                    }
                }

                return updatedLineItem;
            })
        );
    };

    const toggleLineItemExpansion = (lineItemId) => {
        setExpandedLineItemIds(prev =>
            prev?.includes(lineItemId) ? prev.filter(id => id !== lineItemId) : [...prev, lineItemId]
        );
    };

    const handleAddItemToLine = (newItem) => {
        setLineItem(prev =>
            prev.map(li => {
                if (li.po_line_item_id !== selectedLineItemIdForAdd) return li;

                // If editing existing subitem
                if (editingSubItem) {
                    return {
                        ...li,
                        items: li.items.map(si =>
                            si.po_line_item_id === editingSubItem.po_line_item_id
                                ? { ...si, ...newItem }
                                : si
                        )
                    };
                }

                // Add new subitem
                return {
                    ...li,
                    items: [...li.items, {
                        po_line_item_id: uuidv4(),
                        ...newItem
                    }]
                };
            })
        );
        setSelectedLineItemIdForAdd(null);
        setEditingSubItem(null);
    };

    const handleEditSubItem = (parentId, subItem) => {
        setSelectedLineItemIdForAdd(parentId);
        setEditingSubItem(subItem);
    };

    const handleDeleteSubItem = (parentId, subItemId) => {
        setLineItem(prev =>
            prev.map(li =>
                li.po_line_item_id === parentId
                    ? {
                        ...li,
                        items: li.items.filter(si => si.po_line_item_id !== subItemId)
                    }
                    : li
            )
        );
    };

    const handleLineItemSelect = (lineItemId) => {
        if (isCreate) {
            setLineItem(prev =>
                prev.map(li =>
                    li.po_line_item_id === lineItemId
                        ? { ...li, selected: !li.selected } // ✅ toggle selected
                        : li
                )
            );
        }
    };

    const handleBulkSelectLineItems = (isSelected) => {
        if (isCreate) {
            const filteredIds = new Set(filteredLineItems.map(item => item.po_line_item_id));

            setLineItem(prev =>
                prev.map(li =>
                    filteredIds.has(li.po_line_item_id)
                        ? { ...li, selected: isSelected }
                        : li
                )
            );
        }
    };

    const countItems = (lineItem) => {
        const count = lineItem.reduce((acc, item) => {
            return acc + (item.item_serial_number ? item.item_serial_number.length : 0);
        }, 0);
        return count;
    };

    const headerSections = [...(isCreate ? [''] : []), , 'Line Number', 'Line Name', 'Description', 'Quantity', 'Unit', 'Price', 'Qty Offered', ...(task !== 'Create Inspection' ? ['Warranty'] : []), 'Actions'];

    const commonSelectProps = {
        menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
        menuPosition: 'absolute',
        styles: {
            menuPortal: base => ({ ...base, zIndex: 10000 }),
            control: base => ({ ...base, minHeight: '42px', maxHeight: '65px', overflowY: 'auto' }),
            valueContainer: base => ({ ...base, maxHeight: '65px', overflowY: 'auto' }),
            menu: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
            menuList: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'none', zIndex: 10000 }),
            indicatorSeparator: base => ({ ...base, display: 'none' }),
            indicatorsContainer: base => ({ ...base, }),
            multiValue: base => ({ ...base, maxWidth: '95%' }),
        }
    };
    // define variable for style scroll width thin
    const scrollbarStyle = { scrollbarWidth: "thin", msOverflowStyle: "none" };
    return (
        <div key={po?.id} className="flex flex-col">
            <div className='p-4 border rounded-md shadow'>
                <div className="flex flex-col gap-1 mb-4">
                    <div>
                        <input
                            type='text'
                            placeholder='Search by line number, name or description'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                    <div
                        ref={tableContainerRef}
                        className="overflow-auto scrollbar-hide max-h-[80vh]"
                        style={scrollbarStyle}
                    >


                        {/* Fixed width container to prevent text wrapping */}
                        <div
                            className="min-w-max"
                            style={{ minWidth: task !== 'Create Inspection' ? '1800px' : '1200px' }}
                        >
                            <div className={`grid ${task !== 'Create Inspection' ? 'grid-cols-11' : 'grid-cols-11'} gap-1`}>
                                {headerSections.map((section, idx) => (
                                    <div
                                        key={section === '' ? 'Select' : section}
                                        className={`p-2 border rounded bg-gray-100 text-sm w-full font-semibold text-center ${(section === 'Line Name' || section === 'Description') ? 'col-span-2' : ''} ${(section === '') ? 'w-10' : ''}`} // Optional: make 'Select' column smaller
                                    >
                                        {isCreate && section === '' ? ( // Check if it's the new 'Select' column
                                            <input type="checkbox" checked={filteredLineItems.length > 0 && filteredLineItems.every((item) => item.selected)} onChange={(e) => handleBulkSelectLineItems(e.target.checked)} className="w-4 h-4 checked:bg-blue-500" />
                                        ) : (
                                            section
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredLineItems?.map((item) => (
                                <div key={item.po_line_item_id} className={`flex flex-col gap-2 p-0.5 border rounded ${item.quantity_offered !== countItems(item.items) && task !== 'Create Inspection' ? 'border-red-500' : ''}`}>
                                    <div className={`grid ${task !== 'Create Inspection' ? 'grid-cols-11' : 'grid-cols-11'} gap-1`}>
                                        {isCreate && <div className='flex items-center justify-center'>
                                            <input type="checkbox" checked={item.selected || false} onChange={() => handleLineItemSelect(item.po_line_item_id)} className="w-4 h-4" />
                                        </div>}
                                        <input type="text" placeholder='Line Number' className={`text-center ${item.line_number ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.line_number || ''} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'line_number')} />
                                        <input type="text" placeholder='Enter Name' className={`text-center col-span-2  ${item.line_item_name ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.line_item_name} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'line_item_name')} />
                                        <input type="text" placeholder='Description' className={`text-center col-span-2 ${item.description ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.description} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'description')} />
                                        <input type="number" placeholder='Enter Quantity' className={`text-center ${item.total_quantity > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.total_quantity} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'total_quantity')} />
                                        <input type="text" placeholder='Unit' className={`text-center ${item.unit_measurement ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.unit_measurement} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'unit_measurement')} />
                                        <input type='number' placeholder='Price' className={`text-center ${item.unit_price > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.unit_price} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'unit_price')} />
                                        <input type="number" placeholder='Enter Qty Offered' className={`text-center ${item.quantity_offered > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.quantity_offered} readOnly={!item.isNew && task !== 'Create Inspection'} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'quantity_offered')} />
                                        {task !== 'Create Inspection' &&
                                            <CreatableSelect
                                                placeholder='YYYY-MM-DD'
                                                className={`text-center ${item.warranty_start ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`}
                                                options={[{ value: 'PO Date', label: 'PO Date' }]}
                                                value={item?.warranty_start ? { value: item.warranty_start, label: item.warranty_start } : null}
                                                readOnly={!item.isNew}
                                                {...commonSelectProps}
                                                isClearable
                                                onChange={(e) => handleLineItemChange(item.po_line_item_id, e?.value ? e.value : null, 'warranty_start')}
                                            />}
                                        <div className="flex gap-2 ml-auto w-full justify-center">
                                            <button
                                                onClick={() => toggleLineItemExpansion(item.po_line_item_id)}
                                                className="inline-flex items-center text-gray-500 text-sm px-2 py-1 ml-1 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200 h-auto"
                                                type="button"
                                            >
                                                <DownArrow
                                                    className={`w-4 h-4 mr-1 transition-transform duration-200 ${expandedLineItemIds?.includes(item.po_line_item_id) ? 'rotate-180' : ''
                                                        }`}
                                                />
                                                Item{item?.items?.length > 0 && (<>({countItems(item.items)})</>)}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedLineItemIds?.includes(item.po_line_item_id) && (
                                        <div className="ml-4 pl-4 border-l-2 border-gray-200">
                                            <div className="flex flex-col gap-2">
                                                {item.items.length > 0 && (
                                                    // Replace the grid container with flexbox
                                                    <div className="overflow-auto">
                                                        <div
                                                            className="min-w-max max-h-[300px] overflow-y-auto scrollbar-hide"
                                                            style={scrollbarStyle}
                                                        >
                                                            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

                                                            {/* Header Row - Flexbox */}
                                                            <div className="flex gap-2 whitespace-nowrap">
                                                                {[
                                                                    "Type",
                                                                    "Make",
                                                                    "Model",
                                                                    "Part",
                                                                    "Desc",
                                                                    ...(isCreate ? [] : ["Qty Inspected"]), // Add Qty Inspected column when not isCreate
                                                                    ...(isCreate ? [] : ["S.N"]),
                                                                    ...(isCreate ? [] : ["Remarks"]),
                                                                    "Action"
                                                                ].map((header, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`p-2 font-semibold rounded-t-md flex-shrink-0 ${i === 0 ? "bg-blue-50 text-blue-800 w-[250px]" :
                                                                            i === 1 ? "bg-green-50 text-green-800 w-[250px]" :
                                                                                i === 2 ? "bg-yellow-50 text-yellow-800 w-[250px]" :
                                                                                    i === 3 ? "bg-red-50 text-red-800 w-[250px]" :
                                                                                        i === 4 ? "bg-purple-50 text-purple-800 w-[300px]" :
                                                                                            i === 5 && !isCreate ? "bg-cyan-50 text-cyan-800 w-[150px]" : // Qty Inspected
                                                                                                i === 6 && !isCreate ? "bg-indigo-50 text-indigo-800 w-[300px]" : // S.N
                                                                                                    i === 7 && !isCreate ? "bg-sky-50 text-sky-800 w-[200px]" : // Remarks
                                                                                                        "bg-gray-100 text-gray-800 w-[100px]" // Action or fallback
                                                                            }`}
                                                                    >
                                                                        {header}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Data Rows - Flexbox */}
                                                            <div className="flex flex-col gap-2">
                                                                {item.items.map((subItem, idx) => (
                                                                    <div key={idx} className="flex gap-2 whitespace-nowrap">
                                                                        <div className="p-2 bg-blue-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.item_type}</div>
                                                                        <div className="p-2 bg-green-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.item_make}</div>
                                                                        <div className="p-2 bg-yellow-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.item_model}</div>
                                                                        <div className="p-2 bg-red-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.item_part}</div>
                                                                        <div className="p-2 bg-purple-100 w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.description}</div>

                                                                        {/* Conditionally render Qty Inspected column */}
                                                                        {!isCreate && (
                                                                            <div className="p-2 bg-cyan-100 w-[150px] overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                                                                                {subItem.quantity_inspected || "_"} {/* Use appropriate field from subItem */}
                                                                            </div>
                                                                        )}

                                                                        {/* Conditionally render Serial Number column */}
                                                                        {!isCreate && (
                                                                            <div className="p-2 bg-indigo-100 w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide transform flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                                                                                {Array.isArray(subItem.item_serial_number) && subItem.item_serial_number.length > 0
                                                                                    ? subItem.item_serial_number.join(", ")
                                                                                    : typeof subItem.item_serial_number === 'string' && subItem.item_serial_number.trim() !== ""
                                                                                        ? subItem.item_serial_number
                                                                                        : "-"}
                                                                            </div>
                                                                        )}

                                                                        {/* Conditionally render Remarks column */}
                                                                        {!isCreate && (
                                                                            <div className="p-2 bg-sky-100 w-[200px] overflow-x-auto whitespace-nowrap scrollbar-hide transform flex-shrink-0" style={{ scrollbarWidth: 'none' }}>{subItem.remarks || "None"}</div>
                                                                        )}

                                                                        {/* Action buttons - always shown */}
                                                                        <div className="flex justify-center items-center gap-1 p-2 bg-gray-50 w-[100px] flex-shrink-0">
                                                                            <button
                                                                                onClick={() => handleEditSubItem(item.po_line_item_id, subItem)}
                                                                            >
                                                                                <Edit />
                                                                            </button>
                                                                            {isCreate && <button
                                                                                onClick={() => handleDeleteSubItem(item.po_line_item_id, subItem.po_line_item_id)}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </button>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {task !== 'Add Item Details' && <button
                                                    onClick={() => {
                                                        setSelectedLineItemIdForAdd(item.po_line_item_id);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                >
                                                    <RoundAddCircle />
                                                    <span>Add Item</span>
                                                </button>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {!lineItem?.length && (<div className='max-h-[200px] w-full flex flex-wrap justify-center items-center'>
                    <p className="w-full text-center text-sm text-gray-500">Select PO for line items</p>
                </div>
                )}
            </div>
            {/* checkbox for digitally signed */}
            {task !== 'Create Inspection' && <div className="flex items-center gap-2 mb-2  border border-gray-300 rounded-md p-4 bg-slate-50">
                <input
                    type="checkbox"
                    id="digitalSigned"
                    className='w-4 h-4 ml-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                    checked={digitalSignature === 'Digitally_Esign'}
                    onChange={(e) => setDigitalSignature(e.target.checked ? 'Digitally_Esign' : 'Physically_Sign')}
                />
                <label htmlFor="digitalSigned">Click here if you want to digitally sign the certificate for this inspection.</label>
            </div>}

            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={onCancel}
                    className="inline-flex items-center justify-center px-6 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={(e) => onSubmit(e, lineItem.filter(li => li.selected), digitalSignature)}
                    className={`inline-flex items-center justify-center px-6 py-2 bg-green-400 hover:bg-green-300 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? (<OnSubmitLoading />) : 'Submit'}
                </button>
            </div>
            {Boolean(selectedLineItemIdForAdd) && <ItemsForm
                isOpen={selectedLineItemIdForAdd !== null}
                onSave={handleAddItemToLine}
                onCancel={() => {
                    setSelectedLineItemIdForAdd(null);
                    setEditingSubItem(null);
                }}
                initialValues={editingSubItem || {}}
                existingSerialNumbers={allExistingSerials}
                task={task}
            />}
        </div>
    );
};

export default LineItemForm;