import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DeleteIcon, DownArrow, Edit, OnSubmitLoading, RoundAddCircle } from '../../utils/icons.jsx';
import ItemsForm from './itemsForm.jsx';

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
            po_line_item_id: li.po_line_item_id || uuidv4(),
            isNew: false,
            line_item_name: li.line_item_name || '',      // make sure you map the correct field
            total_quantity: li.total_quantity || null,
            quantity_offered: li.quantity_offered || null,
            quantity_inspected: li.quantity_inspected || null,
            po_line_item_status: li?.po_line_item_status || null,
            phases: li?.phases || null,
            item_location: li?.item_location || null,
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
            })),
        })));
    }, [defaultValues]);

    const handleLineItemChange = (lineItemId, newValue, fieldName) => {
        // Ensure numeric-only input for the 3 fields
        if (['total_quantity', 'quantity_offered', 'quantity_inspected'].includes(fieldName)) {
            newValue = newValue.replace(/[^0-9]/g, '');
            newValue = newValue === '' ? '' : parseInt(newValue); // Convert to number or keep as empty string
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

    const handleDeleteLineItem = (lineItemId) => {
        setLineItem(prev => prev.filter(item => item.po_line_item_id !== lineItemId));
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

    const countItems = (lineItem) => {
        const count = lineItem.reduce((acc, item) => {
            return acc + (item.item_serial_number ? item.item_serial_number.length : 0);
        }, 0);
        return count;
    };

    return (
        <div key={po?.id} className="flex flex-col">
            <div className='mb-8 p-4 border rounded-md shadow'>
                <div className="flex flex-col gap-1 mb-4">
                    <div className="grid grid-cols-5 gap-2">
                        {['Line Item', 'Quantity', 'Qty Offered', 'Qty Inspected', 'Action'].map(section => (
                            <div
                                key={section}
                                className={`p-2 border rounded bg-gray-100 text-sm font-semibold text-center ${section === 'Action' ? 'col-span-1' : ''}`}
                            >
                                {section}
                            </div>
                        ))}
                    </div>
                    {lineItem?.map((item) => (
                        <div key={item.po_line_item_id} className={`flex flex-col gap-2 p-1 border rounded ${item.quantity_offered !== countItems(item.items) ? 'border-red-500' : ''}`}>
                            <div className="grid grid-cols-5 gap-2">
                                <input type="text" placeholder='Enter Name' className={`text-center  ${item.line_item_name ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.line_item_name} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'line_item_name')} />
                                <input type="number" placeholder='Enter Quantity' className={`text-center ${item.total_quantity > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.total_quantity} readOnly={!item.isNew} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'total_quantity')} />
                                <input type="number" placeholder='Enter Qty Offered' className={`text-center ${item.quantity_offered > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.quantity_offered} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'quantity_offered')} />
                                <input type="number" placeholder='Enter Qty Inspected' className={`text-center ${item.quantity_inspected > 0 ? 'border-gray-200' : 'border border-1 rounded-md border-red-500'}`} value={item.quantity_inspected} onChange={(e) => handleLineItemChange(item.po_line_item_id, e.target.value, 'quantity_inspected')} />
                                <div className="flex gap-2 ml-auto w-full justify-center">
                                    {item?.items?.length > 0 && <span className="flex items-center bg-blue-800 text-white px-4 rounded-full text-xs">{countItems(item.items)}</span>}
                                    {/* Remove button */}
                                    {(!item.po_line_item_status || item.po_line_item_status === 'Correction Required') &&
                                        <button
                                            onClick={() => handleDeleteLineItem(item.po_line_item_id)}
                                            aria-label="Remove line item"
                                        >
                                            <DeleteIcon />
                                        </button>}
                                    {/* button to show item details */}
                                    <button
                                        onClick={() => toggleLineItemExpansion(item.po_line_item_id)}
                                        className="text-gray-500 text-xl p-2 ml-1 rounded-md bg-gray-50 hover:bg-gray-100 transition duration-200">
                                        <DownArrow className={expandedLineItemIds?.includes(item.po_line_item_id) ? 'rotate-180' : ''} />
                                    </button>
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
                                                        gridTemplateColumns: "auto auto auto auto auto auto auto"
                                                    }}>
                                                        {/* — Header Row — */}
                                                        {[
                                                            "Type",
                                                            "Make",
                                                            "Model",
                                                            "Part",
                                                            "Desc",
                                                            "S.N",
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
                                                                ][i % 6]} `}
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
                                                                <div className="p-2 bg-purple-100 w-[350px] overflow-x-auto whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>{subItem.description}</div>
                                                                <div className="p-2 bg-indigo-100 w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide transform" style={{ scrollbarWidth: 'none' }}>
                                                                    {Array.isArray(subItem.item_serial_number)
                                                                        ? subItem.item_serial_number.join(", ")
                                                                        : subItem.item_serial_number}
                                                                </div>
                                                                <div className="flex justify-end gap-1 p-2">
                                                                    <button
                                                                        onClick={() => handleEditSubItem(item.po_line_item_id, subItem)}
                                                                    //className="p-1 hover:bg-blue-100 rounded"
                                                                    >
                                                                        <Edit />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSubItem(item.po_line_item_id, subItem.po_line_item_id)}
                                                                    //className="p-1 hover:bg-red-100 rounded"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </button>
                                                                </div>
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
            <div className="flex items-center gap-2 mb-2  border border-gray-300 rounded-md p-4 bg-slate-50">
                <input
                    type="checkbox"
                    id="digitalSigned"
                    className='w-4 h-4 ml-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                    checked={digitalSignature === 'Digitally_Esign'}
                    onChange={(e) => setDigitalSignature(e.target.checked ? 'Digitally_Esign' : 'Physically_Sign')}
                />
                <label htmlFor="digitalSigned">Click here if you want to digitally sign the certificate for this inspection.</label>
            </div>

            <div className="flex justify-end gap-4 mt-4">
                <button
                    onClick={onCancel}
                    className="inline-flex items-center justify-center px-6 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:text-gray-700 hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={(e) => onSubmit(e, lineItem, digitalSignature)}
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