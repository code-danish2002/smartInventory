import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DeleteIcon, DownArrow, Edit, OnSubmitLoading, RoundAddCircle } from '../../utils/icons.jsx';
import ItemsForm from './itemsForm.jsx';
import CreatableSelect from 'react-select/creatable';

const LineItemForm = ({ po, defaultValues, onSubmit, onCancel, loading, task }) => {
    const [lineItem, setLineItem] = useState([]);
    const [digitalSignature, setDigitalSignature] = React.useState('Physically_Sign');
    const [expandedLineItemIds, setExpandedLineItemIds] = React.useState([]);
    const [selectedLineItemIdForAdd, setSelectedLineItemIdForAdd] = React.useState(null);
    const [editingSubItem, setEditingSubItem] = React.useState(null);

    console.log('default values', defaultValues, 'lineItem', lineItem);

    useEffect(() => {
        if (!defaultValues) return;

        setLineItem(defaultValues.map(li => ({
            po_line_item_id: li.po_line_item_id || li.erp_po_line_item_id || uuidv4(),
            isNew: false,
            selected: true,
            line_item_name: li.line_item_name || '',      // make sure you map the correct field
            total_quantity: li.total_quantity || null,
            quantity_offered: li.quantity_offered || null,
            quantity_inspected: li.quantity_inspected || null,
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
                item_serial_number: Array.isArray(d.item_serial_number)
                    ? d.item_serial_number
                    : [d.item_serial_number],
                item_type_id: d.item_type_id,
                item_make_id: d.item_make_id,
                item_model_id: d.item_model_id,
                item_part_id: d.item_part_id,
                item_type: d.item_type_name,
                item_make: d.item_make_name,
                item_model: d.item_model_name,
                item_part: d.item_part_code,
                description: d.item_part_description,
                remarks: d.remarks,
            })),
        })));
    }, [defaultValues]);

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
        if (task === 'Create Inspection') {
            setLineItem(prev =>
                prev.map(li =>
                    li.po_line_item_id === lineItemId
                        ? { ...li, selected: !li.selected } // ✅ toggle selected
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

    const headerSections = ['Line Item', 'Description', 'Quantity', 'Unit', 'Price', 'Qty Offered', ...(task !== 'Create Inspection' ? ['Warranty'] : []), ...(task !== 'Create Inspection' ? ['Qty Inspected'] : []), ...(task === 'Create Inspection' ? ['Select'] : ['Action'])];

    return (
        <div key={po?.id} className="flex flex-col">
            <div className='mb-8 p-4 border rounded-md shadow'>
                <div className="flex flex-col gap-1 mb-4 overflow-auto">
                    <div className={`min-w-max grid ${task !== 'Create Inspection' ? 'grid-cols-11' : 'grid-cols-9'} gap-1`}>
                        {headerSections.map(section => (
                            <div
                                key={section}
                                className={`p-2 border rounded bg-gray-100 text-sm font-semibold text-center ${(section === 'Line Item' || section === 'Description') ? 'col-span-2' : ''}`}
                            >
                                {section}
                            </div>
                        ))}
                    </div>
                    {lineItem?.map((item) => (
                        <div key={item.po_line_item_id} className={`flex flex-col gap-2 p-0.5 border rounded ${item.quantity_offered !== countItems(item.items) && task !== 'Create Inspection' ? 'border-red-500' : ''}`}>
                            <div className={`grid ${task !== 'Create Inspection' ? 'grid-cols-11' : 'grid-cols-9'} gap-1`}>
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
                                        options={[{ value: 'PSE', label: 'PSE' }, { value: 'PO Date', label: 'PO Date' }]}
                                        value={item?.warranty_start ? { value: item.warranty_start, label: item.warranty_start } : null}
                                        readOnly={!item.isNew}
                                        isClearable
                                        onChange={(e) => handleLineItemChange(item.po_line_item_id, e?.value ? e.value : null, 'warranty_start')}
                                    />}
                                {task !== 'Create Inspection' && <input type="number" placeholder='Enter Qty Inspected' className={`text-center ${item.quantity_inspected > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.quantity_inspected} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'quantity_inspected')} />}
                                <div className="flex gap-2 ml-auto w-full justify-center">
                                    {item?.items?.length > 0 && <span className="flex items-center bg-blue-800 text-white px-2 rounded-full text-xs">{countItems(item.items)}</span>}
                                    {/* Remove button */}
                                    {/* {(!item.po_line_item_status || item.po_line_item_status === 'Correction Required') &&
                                        <button
                                            onClick={() => handleDeleteLineItem(item.po_line_item_id)}
                                            aria-label="Remove line item"
                                        >
                                            <DeleteIcon />
                                        </button>} */}
                                    {/* checkbox to select current lineItem to be in lineItemForm for submission */}
                                    {task === 'Create Inspection' && <input type="checkbox" checked={item.selected || false} onChange={() => handleLineItemSelect(item.po_line_item_id)} />}
                                    {/* button to show item details */}
                                    {task !== 'Create Inspection' && (
                                        <button
                                            onClick={() => toggleLineItemExpansion(item.po_line_item_id)}
                                            className="inline-flex items-center text-gray-500 text-sm px-2 py-1 ml-1 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200 h-auto"
                                            type="button"
                                        >
                                            <DownArrow
                                                className={`w-4 h-4 mr-1 transition-transform duration-200 ${expandedLineItemIds?.includes(item.po_line_item_id) ? 'rotate-180' : ''
                                                    }`}
                                            />
                                            Item
                                        </button>
                                    )}

                                </div>
                            </div>
                            {expandedLineItemIds?.includes(item.po_line_item_id) && (
                                <div className="ml-4 pl-4 border-l-2 border-gray-200">
                                    <div className="flex flex-col gap-2">
                                        {item.items.length > 0 && (
                                            <div className="overflow-auto">
                                                <div
                                                    className="inline-block min-w-max max-h-[300px] overflow-y-auto scrollbar-hide"
                                                    style={{
                                                        /* same scrollbar-hiding as before */
                                                        scrollbarWidth: "none",
                                                        msOverflowStyle: "none"
                                                    }}
                                                >
                                                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                                                    {/* grid with 7 columns: 6 data columns + 1 for actions */}
                                                    <div className="grid gap-2 whitespace-nowrap" style={{
                                                        gridTemplateColumns: "auto auto auto auto auto auto auto auto",
                                                    }}>
                                                        {/* — Header Row — */}
                                                        {[
                                                            "Type",
                                                            "Make",
                                                            "Model",
                                                            "Part",
                                                            "Desc",
                                                            "S.N", ,
                                                            "Remarks",
                                                            "Action"          // empty header for the action buttons
                                                        ].map((header, i) => (
                                                            <div
                                                                key={i}
                                                                className={` p-2 font-semibold rounded-t-md ${[
                                                                    "bg-blue-50 text-blue-800",
                                                                    "bg-green-50 text-green-800",
                                                                    "bg-yellow-50 text-yellow-800",
                                                                    "bg-red-50 text-red-800",
                                                                    "bg-purple-50 text-purple-800",
                                                                    "bg-indigo-50 text-indigo-800",
                                                                    "bg-sky-50 text-sky-800",
                                                                ][i % 7]} `}
                                                            >
                                                                {header}
                                                            </div>
                                                        ))}

                                                        {/* — Data Rows — */}
                                                        {item.items.map((subItem, idx) => (
                                                            <React.Fragment key={idx}>
                                                                <div className="p-2 bg-blue-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.item_type}</div>
                                                                <div className="p-2 bg-green-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.item_make}</div>
                                                                <div className="p-2 bg-yellow-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.item_model}</div>
                                                                <div className="p-2 bg-red-100 w-[250px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.item_part}</div>
                                                                <div className="p-2 bg-purple-100 w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.description}</div>
                                                                <div className="p-2 bg-indigo-100 w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide transform" style={{ scrollbarWidth: 'none' }}>
                                                                    {Array.isArray(subItem.item_serial_number)
                                                                        ? subItem.item_serial_number.join(", ")
                                                                        : subItem.item_serial_number}
                                                                </div>
                                                                <div className="p-2 bg-sky-100 w-[200px] overflow-x-auto whitespace-nowrap scrollbar-hide transform" style={{ scrollbarWidth: 'none' }}>{subItem.remarks || "None"}</div>
                                                                {["Correction Required", "Data Request"].includes(item.po_line_item_status) ? <div className="flex justify-center gap-1 p-2">
                                                                    <button
                                                                        onClick={() => handleEditSubItem(item.po_line_item_id, subItem)}
                                                                    //className="p-1 hover:bg-blue-100 rounded"
                                                                    >
                                                                        <Edit />
                                                                    </button>
                                                                    {item.po_line_item_status === "Data Request" && <button
                                                                        onClick={() => handleDeleteSubItem(item.po_line_item_id, subItem.po_line_item_id)}
                                                                    //className="p-1 hover:bg-red-100 rounded"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </button>}
                                                                </div> : <span className="p-2 text-gray-500">{item.po_line_item_status}</span>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedLineItemIdForAdd(item.po_line_item_id);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <RoundAddCircle />
                                            <span>Add Item</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {!lineItem?.length && (<p className="w-full text-center text-sm text-gray-500">Select PO for line items</p>)}
                {/* <button
                    onClick={() => {
                        const newLineItemId = uuidv4();
                        setLineItem(prev => [...(prev || []), { po_line_item_id: newLineItemId, line_item_name: '', total_quantity: null, quantity_offered: null, quantity_inspected: null, items: [], isNew: true }]);
                    }}
                    className="flex justify-center items-center gap-2 w-full p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                >
                    <RoundAddCircle className="w-5 h-5" />
                    Add Line Item
                </button> */}
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
            />}
        </div>
    );
};

export default LineItemForm;