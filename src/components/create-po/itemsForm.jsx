
// src/components/ItemDetailsModal.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import api from '../../api/apiCall.js';
import { useToast } from '../../context/toastProvider.jsx';

// --- New: Loading Spinner Component for reusability ---
const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
// -----------------------------------------------------

export default function ItemsForm({ isOpen, initialValues = {}, onSave, onCancel, maxInspected, existingSerialNumbers = [], task }) {
    const [descriptions, setDescriptions] = useState({});
    const [CSVorManual, setCSVorManual] = useState('Manual');
    const [localErrors, setLocalErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isDataRestored = useRef(false);
    const addToast = useToast();

    // Refs to track loading states and prevent race conditions
    const isCascadeLoading = useRef(false);

    const initialSerialNumbers = useMemo(() => {
        return Array.isArray(initialValues.item_serial_number)
            ? [...initialValues.item_serial_number]
            : [];
    }, [initialValues.item_serial_number]);

    const [itemDetails, setItemDetails] = useState({
        item_type_id: '',
        item_make_id: '',
        item_model_id: '',
        item_part_id: '',
        description: descriptions?.[initialValues?.item_part_id] || '',
        item_serial_number: [],
        remarks: '',
        item_status: '',
        item_location: '',
        item_type: '',
        item_make: '',
        item_model: '',
        item_part: '',
        quantity_inspected: '',
    });

    const [itemOptions, setItemOptions] = useState({
        item_type_id: [],
        item_make_id: [],
        item_model_id: [],
        item_part_id: [],
        // Existing loading states
        loading_item_type_id: true,
        loading_item_make_id: true,
        loading_item_model_id: true,
        loading_item_part_id: true,
        // --- New: Error states for API calls/empty data ---
        error_item_type_id: null,
        error_item_make_id: null,
        error_item_model_id: null,
        error_item_part_id: null,
        // ----------------------------------------------------
    });

    const isCreate = task === 'Create Inspection';
    const isAdd = task === 'Add Item Details' || task === 'Update Inspection';

    const elements = [
        { name: 'Item Type', idField: 'item_type_id', type: 'select', optionsKey: 'item_type', isRequired: true },
        { name: 'Item Make', idField: 'item_make_id', type: 'select', optionsKey: 'item_make', isRequired: true },
        { name: 'Item Model', idField: 'item_model_id', type: 'select', optionsKey: 'item_model', isRequired: true },
        { name: 'Item Part', idField: 'item_part_id', type: 'select', optionsKey: 'item_part', isRequired: true },
        { name: 'Description', idField: 'description', type: 'input', isDisabled: true, isReadOnly: true, isRequired: true },
        ...(isAdd ? [
            { name: 'Quantity Inspected', idField: 'quantity_inspected', type: 'input', inputType: 'number', placeholder: 'Enter Qty Inspected', isRequired: true }
        ] : []),
    ];

    useEffect(() => {
        if (isOpen && Object.keys(initialValues).length > 0) {
            isDataRestored.current = false;
            // Clear cascade-dependent options first
            setItemOptions(prev => ({
                ...prev,
                item_make_id: [],
                item_model_id: [],
                item_part_id: [],
                loading_item_make_id: true,  // Set to true initially
                loading_item_model_id: true,
                loading_item_part_id: true,
                error_item_make_id: null,
                error_item_model_id: null,
                error_item_part_id: null,
            }));

            // Set the base values but clear dependent fields to trigger cascade
            setItemDetails(prev => ({
                item_type_id: '',
                item_make_id: '',
                item_model_id: '',
                item_part_id: '',
                description: '',
                item_serial_number: [],
                item_status: '',
                item_location: '',
                item_type: '',
                item_make: '',
                item_model: '',
                item_part: '',
                quantity_inspected: '',
                ...initialValues,
            }));
        }
    }, [isOpen, initialValues]);

    // Add this new useEffect to handle restoring dependent values after cascade completes
    useEffect(() => {
        if (isOpen &&
            Object.keys(initialValues).length > 0 &&
            !itemOptions.loading_item_make_id &&
            !itemOptions.loading_item_model_id &&
            !itemOptions.loading_item_part_id &&
            initialValues.item_type_id &&
            initialValues.item_make_id &&
            initialValues.item_model_id &&
            initialValues.item_part_id &&
            !isDataRestored.current) {

            // Restore all dependent values from initial values
            setItemDetails(prev => ({
                ...prev,
                item_make_id: initialValues.item_make_id,
                item_model_id: initialValues.item_model_id,
                item_part_id: initialValues.item_part_id,
                description: descriptions[initialValues.item_part_id] || prev.description,
                item_type: initialValues.item_type || prev.item_type,
                item_make: initialValues.item_make || prev.item_make,
                item_model: initialValues.item_model || prev.item_model,
                item_part: initialValues.item_part || prev.item_part,
            }));
            isDataRestored.current = true;
        }
    }, [
        isOpen,
        initialValues,
        itemOptions.loading_item_make_id,
        itemOptions.loading_item_model_id,
        itemOptions.loading_item_part_id,
        descriptions
    ]);

    // 1. Load types once
    useEffect(() => {
        if (!isOpen) return; // Only load if modal is open

        console.log('loading item types');
        api.get('/api/item-type')
            .then(r => {
                const opts = r.data.data.map(i => ({ value: i.item_type_id, label: i.item_type_name }));
                setItemOptions((prev) => ({
                    ...prev,
                    item_type_id: opts,
                    loading_item_type_id: false,
                    error_item_type_id: opts.length === 0 ? 'No Item Types found.' : null, // Set error if empty
                }));
            })
            .catch((e) => {
                console.error(e);
                setItemOptions((prev) => ({
                    ...prev,
                    loading_item_type_id: false,
                    error_item_type_id: 'Failed to load Item Types.', // Set error on API failure
                }));
            });
    }, [isOpen]); // Add isOpen to dependency to prevent loading when modal is closed

    // 2. Cascade loads
    useEffect(() => {
        if (!isOpen) return;

        isCascadeLoading.current = true;

        setItemOptions(prev => ({
            ...prev,
            item_make_id: [],
            item_model_id: [],
            item_part_id: [],
            loading_item_make_id: !!itemDetails.item_type_id,
            error_item_make_id: null,
            loading_item_model_id: false,
            error_item_model_id: null,
            loading_item_part_id: false,
            error_item_part_id: null,
        }));

        if (itemDetails.item_type_id) {
            api.get(`/api/item-makes/by-type/${itemDetails.item_type_id}`)
                .then(r => {
                    const opts = r.data.data.map(i => ({ value: i.item_make_id, label: i.item_make_name }));
                    setItemOptions((prev) => ({
                        ...prev,
                        item_make_id: opts,
                        loading_item_make_id: false,
                        error_item_make_id: opts.length === 0 ? 'No Makes found for this Type.' : null,
                    }));
                })
                .catch((e) => {
                    console.error(e);
                    setItemOptions((prev) => ({
                        ...prev,
                        loading_item_make_id: false,
                        error_item_make_id: 'Failed to load Item Makes.',
                    }));
                })
                .finally(() => {
                    isCascadeLoading.current = false;
                });
        } else {
            isCascadeLoading.current = false;
        }
    }, [itemDetails.item_type_id, isOpen]);

    // For the item models effect:
    useEffect(() => {
        if (!isOpen) return;

        isCascadeLoading.current = true;

        setItemOptions(prev => ({
            ...prev,
            item_model_id: [],
            item_part_id: [],
            loading_item_model_id: !!itemDetails.item_make_id,
            error_item_model_id: null,
            loading_item_part_id: false,
            error_item_part_id: null,
        }));

        if (itemDetails.item_make_id) {
            api.get(`/api/item-models/by-make/${itemDetails.item_make_id}`)
                .then(r => {
                    const opts = r.data.data.map(i => ({ value: i.item_model_id, label: i.item_model_name }));
                    setItemOptions((prev) => ({
                        ...prev,
                        item_model_id: opts,
                        loading_item_model_id: false,
                        error_item_model_id: opts.length === 0 ? 'No Models found for this Make.' : null,
                    }));
                })
                .catch((e) => {
                    console.error(e);
                    setItemOptions((prev) => ({
                        ...prev,
                        loading_item_model_id: false,
                        error_item_model_id: 'Failed to load Item Models.',
                    }));
                })
                .finally(() => {
                    isCascadeLoading.current = false;
                });
        } else {
            isCascadeLoading.current = false;
        }
    }, [itemDetails.item_make_id, isOpen]);

    // For the item parts effect:
    useEffect(() => {
        if (!isOpen) return;

        isCascadeLoading.current = true;

        setItemOptions(prev => ({
            ...prev,
            item_part_id: [],
            loading_item_part_id: !!itemDetails.item_model_id,
            error_item_part_id: null,
        }));

        if (itemDetails.item_model_id) {
            api.get(`/api/item-parts/by-model/${itemDetails.item_model_id}`)
                .then(r => {
                    const parts = r.data.data.map(i => ({ value: i.item_part_id, label: i.item_part_code }));
                    const descs = r.data.data.reduce((acc, i) => {
                        acc[i.item_part_id] = i.item_part_description;
                        return acc;
                    }, {});
                    setDescriptions(descs);
                    setItemOptions((prev) => ({
                        ...prev,
                        item_part_id: parts,
                        loading_item_part_id: false,
                        error_item_part_id: parts.length === 0 ? 'No Parts found for this Model.' : null,
                    }));
                })
                .catch((e) => {
                    console.error(e);
                    setItemOptions((prev) => ({
                        ...prev,
                        loading_item_part_id: false,
                        error_item_part_id: 'Failed to load Item Parts.',
                    }));
                })
                .finally(() => {
                    isCascadeLoading.current = false;
                });
        } else {
            isCascadeLoading.current = false;
        }
    }, [itemDetails.item_model_id, isOpen]);

    // 3. When part changes, update description
    useEffect(() => {
        setItemDetails(d => ({ ...d, description: descriptions[d.item_part_id] || '' }));
    }, [itemDetails.item_part_id, descriptions, initialValues]);

    const handleChange = (e, field) => {
        const val = e?.value ?? e?.target?.value ?? '';
        const lbl = e?.label;
        setItemDetails(d => {
            const nxt = { ...d, [field]: val };
            if (field === 'item_type_id') {
                nxt.item_type = lbl;
                nxt.item_make_id = '';
                nxt.item_make = '';
                nxt.item_model_id = '';
                nxt.item_model = '';
                nxt.item_part_id = '';
                nxt.item_part = '';
                nxt.description = '';
            } else if (field === 'item_make_id') {
                nxt.item_make = lbl;
                nxt.item_model_id = '';
                nxt.item_model = '';
                nxt.item_part_id = '';
                nxt.item_part = '';
                nxt.description = '';
            } else if (field === 'item_model_id') {
                nxt.item_model = lbl;
                nxt.item_part_id = '';
                nxt.item_part = '';
                nxt.description = '';
            } else if (field === 'item_part_id') {
                nxt.item_part = lbl;
            } else if (field === 'quantity_inspected') {
                //input will be a positive number and greater than 0
                if (!val) {
                    nxt.quantity_inspected = '';
                    return nxt;
                }
                nxt.quantity_inspected = Math.abs(val);
                if (nxt.quantity_inspected < 1) {
                    nxt.quantity_inspected = 1;
                }
                if (nxt.quantity_inspected > maxInspected) {
                    nxt.quantity_inspected = maxInspected;
                }
            }
            return nxt;
        });
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const rdr = new FileReader();
        rdr.onload = ev => {
            const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
            setItemDetails(d => ({ ...d, item_serial_number: lines }));
        };
        rdr.readAsText(file);
    };

    const isValid = () => {
        // Validation based on task
        if (isCreate) {
            return (
                !!itemDetails.item_type_id &&
                !!itemDetails.item_make_id &&
                !!itemDetails.item_model_id &&
                !!itemDetails.item_part_id &&
                !!itemDetails.description
            );
        } else if (isAdd) {
            return (
                !!itemDetails.item_type_id &&
                !!itemDetails.item_make_id &&
                !!itemDetails.item_model_id &&
                !!itemDetails.item_part_id &&
                !!itemDetails.description &&
                !!itemDetails.quantity_inspected &&
                itemDetails.item_serial_number.length > 0
            );
        }
        return false;
    };

    const validateSerials = (serials) => {
        const newErrors = {};
        // Check against all other serials in the form
        const otherSerials = existingSerialNumbers.filter(serial =>
            !initialSerialNumbers.includes(serial)
        );

        // Check against other items' serials
        const duplicatesInOtherItems = serials.filter(serial =>
            otherSerials.includes(serial)
        );

        if (duplicatesInOtherItems.length > 0) {
            newErrors.duplicate_in_form = `Serial number(s) "${duplicatesInOtherItems.join(', ')}" already used in another line item.`;
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async (e) => {
        console.log('valid', validateSerials(itemDetails.item_serial_number), isValid());
        e.preventDefault();
        setLoading(true);
        console.log('Saving item details:', itemDetails);
        if (!isValid()) {
            setLoading(false);
            addToast({ response: { statusText: 'Please fill out all required fields.' }, type: 'error', status: '400' });
            return;
        };
        if (itemDetails.item_serial_number.length !== maxInspected && isAdd) {
            setLocalErrors({ not_enough_serials: `Please enter only ${maxInspected} serial numbers as per required.` });
            setLoading(false);
            return;
        }
        if (isAdd && !validateSerials(itemDetails.item_serial_number)) {
            setLoading(false);
            return;
        }

        // Check against backend for duplicates
        try {
            if (isAdd) {
                // Check only new/changed serials against database
                const serialsToCheck = itemDetails.item_serial_number.filter(serial =>
                    !initialSerialNumbers.includes(serial)
                );

                if (serialsToCheck.length > 0) {
                    const response = await api.post('/api/items/check_serial', {
                        serial_numbers: serialsToCheck,
                    });

                    const duplicates = response.data.duplicates || [];

                    if (duplicates.length > 0) {
                        addToast({
                            response: { statusText: `Duplicate serial numbers found: ${duplicates.join(', ')}` },
                            type: 'error',
                            status: '400'
                        });
                        setLoading(false);
                        return;
                    }
                }
            }

            onSave(itemDetails);
        } catch (error) {
            console.error("Error checking serial numbers:", error);
            addToast(error);
        } finally {
            setLoading(false);
        }
        //setItemDetails({});
        console.log('Form submitted:', itemDetails);
    };

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

    console.log('itemOptions', itemOptions, initialValues, itemDetails);
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            contentLabel="Add Item Details"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            <div className="bg-white p-4 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl mb-2 bg-gray-100 p-4 flex items-center rounded-md">
                    {Object.keys(initialValues).length ? 'Edit Item Details' : 'Add Item Details'}
                </h2>

                <form onSubmit={submit} className="space-y-4 bg-slate-50 p-4 rounded-md">
                    <div className="flex flex-wrap gap-4">
                        {elements.map(el => {
                            // Check if this element has loading or error states
                            const isLoading = itemOptions[`loading_${el.idField}`];
                            const isError = itemOptions[`error_${el.idField}`];

                            return (
                                <div key={el.idField} className="flex-1 min-w-[180px]">
                                    <label htmlFor={el.idField} className="block text-sm text-gray-700 font-medium flex items-center gap-2">
                                        {el.name}
                                        {isLoading && <LoadingSpinner />} {/* Show spinner if loading */}
                                    </label>

                                    {(el.type === 'input' && el.name !== 'Description') ? (
                                        <input
                                            id={el.idField}
                                            type={el.inputType || 'text'}
                                            name={el.idField}
                                            placeholder={el.placeholder}
                                            className="w-full mt-1 p-2 border rounded"
                                            value={itemDetails[el.idField]}
                                            onChange={e => handleChange(e, el.idField)}
                                            readOnly={el.isReadOnly}
                                        />
                                    ) : (el.type === 'input' && el.name === 'Description') ? (
                                        <textarea
                                            id={el.idField}
                                            name={el.idField}
                                            placeholder={el.placeholder}
                                            className="w-full mt-1 p-2 border rounded"
                                            value={itemDetails[el.idField]}
                                            onChange={e => handleChange(e, el.idField)}
                                            readOnly={el.isReadOnly}
                                            rows={2}
                                        />
                                    )
                                        : (
                                            <>
                                                <Select
                                                    options={itemOptions[el.idField]}
                                                    value={itemOptions[el.idField]?.find(o => o.value === itemDetails[el.idField]) || null}
                                                    onChange={opt => handleChange(opt, el.idField)}
                                                    isClearable
                                                    placeholder={`Select ${el.name}`}
                                                    className="mt-1"
                                                    isDisabled={!isCreate || isLoading || isError} // Disable if loading or error
                                                    isRequired
                                                    menuPortalTarget={document.body}
                                                    {...commonSelectProps}
                                                />
                                                {/* Show error message if an error exists */}
                                                {isError ? (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {isError}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm mt-1">&nbsp;</p> // Keep spacing consistent
                                                )}
                                            </>
                                        )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Serial Number Section */}
                    {isAdd && (

                        <div className="bg-slate-100 p-3 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Item Serial Number</h3>
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                checked={CSVorManual === 'Manual'}
                                                onChange={() => setCSVorManual('Manual')}
                                                className="form-radio"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Manual</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                checked={CSVorManual === 'CSV'}
                                                onChange={() => setCSVorManual('CSV')}
                                                className="form-radio"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">CSV</span>
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        {CSVorManual === 'Manual' ? (
                                            <CreatableSelect
                                                isMulti
                                                placeholder="Enter & press Enter"
                                                value={(itemDetails.item_serial_number || []).map(v => ({ label: v, value: v }))}
                                                onChange={sel =>
                                                    setItemDetails(d => ({ ...d, item_serial_number: sel.map(o => o.value) }))
                                                }
                                                className="w-full"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menu: base => ({ ...base, zIndex: 9999 }),
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    control: base => ({ ...base, minHeight: '45px', maxHeight: '120px', overflowY: 'auto' }),
                                                    valueContainer: base => ({ ...base, maxHeight: '100px', overflowY: 'auto' })
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFile}
                                                className="w-full text-sm text-gray-600"
                                            />
                                        )}
                                    </div>
                                </div>
                                {Object.keys(localErrors).length > 0 && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {localErrors.duplicate_in_form || localErrors.not_enough_serials}
                                    </p>
                                )}
                            </>
                        </div>
                    )}

                    {isAdd && (<div className="bg-slate-100 p-3 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Remarks</h3>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={itemDetails.remarks || ''}
                            onChange={e => setItemDetails(d => ({ ...d, remarks: e.target.value }))}
                        />
                    </div>)}

                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                        <button type="button" onClick={onCancel} className="min-w-[100px] px-4 py-1 border rounded border-gray-300 hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="min-w-[100px] px-4 py-1 bg-green-600 text-white rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}