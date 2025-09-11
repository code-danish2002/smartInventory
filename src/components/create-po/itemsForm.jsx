// src/components/ItemDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import api from '../../api/apiCall.js';

export default function ItemsForm({ isOpen, initialValues = {}, onSave, onCancel, }) {
    const [descriptions, setDescriptions] = useState({});
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
    });
    const [itemOptions, setItemOptions] = useState({
        item_type_id: [],
        item_make_id: [],
        item_model_id: [],
        item_part_id: [],
        loading_item_type_id: true,
        loading_item_make_id: true,
        loading_item_model_id: true,
        loading_item_part_id: true,
    });
    const [CSVorManual, setCSVorManual] = useState('Manual');

    const elements = [
        { name: 'Item Type', idField: 'item_type_id', type: 'select', optionsKey: 'item_type', isRequired: true },
        { name: 'Item Make', idField: 'item_make_id', type: 'select', optionsKey: 'item_make', isRequired: true },
        { name: 'Item Model', idField: 'item_model_id', type: 'select', optionsKey: 'item_model', isRequired: true },
        { name: 'Item Part', idField: 'item_part_id', type: 'select', optionsKey: 'item_part', isRequired: true },
        { name: 'Description', idField: 'description', type: 'input', isDisabled: true, isRequired: true },
    ];


    useEffect(() => {
        if (isOpen && initialValues) {
            setItemDetails({
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
                ...initialValues,
            });
        }
    }, [isOpen, initialValues]);

    // 1. Load types once
    useEffect(() => {
        api.get('/api/item-types')
            .then(r => {
                const opts = r.data.data.map(i => ({ value: i.item_type_id, label: i.item_type_name }));
                setItemOptions((prev) => ({
                    ...prev,
                    item_type_id: opts,
                    loading_item_type_id: false,
                }));
            })
            .catch((e) => { console.error(e); });
    }, []);

    // 2. Cascade loads
    useEffect(() => {
        if (itemDetails.item_type_id) {
            api.get(`/api/item-makes/by-type/${itemDetails.item_type_id}`)
                .then(r => setItemOptions((prev) => ({
                    ...prev,
                    item_make_id: r.data.data.map(i => ({ value: i.item_make_id, label: i.item_make_name })),
                    loading_item_make_id: false
                })))
                .catch((e) => { console.error(e); });
        }
        if (itemDetails.item_make_id) {
            api.get(`/api/item-models/by-make/${itemDetails.item_make_id}`)
                .then(r => setItemOptions((prev) => ({
                    ...prev,
                    item_model_id: r.data.data.map(i => ({ value: i.item_model_id, label: i.item_model_name })),
                    loading_item_model_id: false
                })))
                .catch((e) => { console.error(e); });
        }
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
                        loading_item_part_id: false
                    }));
                })
                .catch((e) => { console.error(e); });
        }
    }, [itemDetails.item_type_id, itemDetails.item_make_id, itemDetails.item_model_id]);

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

    const isValid = () =>
        !!itemDetails.item_type_id &&
        !!itemDetails.item_make_id &&
        !!itemDetails.item_model_id &&
        !!itemDetails.item_part_id &&
        !!itemDetails.description &&
        itemDetails.item_serial_number.length > 0;

    const submit = (e) => {
        e.preventDefault();
        if (!isValid()) return;
        onSave(itemDetails);
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
                        {elements.map(el => (
                            <div key={el.idField} className="flex-1 min-w-[180px]">
                                <label htmlFor={el.idField} className="block text-sm text-gray-700 font-medium">
                                    {el.name}
                                </label>

                                {el.type === 'input' ? (
                                    <input
                                        id={el.idField}
                                        name={el.idField}
                                        className="w-full mt-1 p-2 border rounded"
                                        value={itemDetails[el.idField]}
                                        readOnly
                                    />
                                ) : (
                                    <>
                                        <Select
                                            options={itemOptions[el.idField]}
                                            value={itemOptions[el.idField]?.find(o => o.value === itemDetails[el.idField]) || null}
                                            onChange={opt => handleChange(opt, el.idField)}
                                            isClearable
                                            placeholder={`Select ${el.name}`}
                                            className="mt-1"
                                            menuPortalTarget={document.body}
                                            {...commonSelectProps}
                                        />
                                        {itemOptions?.[el.idField]?.length > 0 && !itemOptions ? [`loading_${el.idField}`](
                                            <p className="text-red-500 text-sm mt-1">
                                                Failed to get options
                                            </p>
                                        ) : (
                                            <p className="text-sm mt-1">&nbsp;</p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Serial Number Section */}
                    <div className="bg-slate-100 p-3 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Item Serial Number</h3>
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
                    </div>

                    <div className="bg-slate-100 p-3 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Remarks</h3>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={itemDetails.remarks || ''}
                            onChange={e => setItemDetails(d => ({ ...d, remarks: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                        <button type="button" onClick={onCancel} className="min-w-[100px] px-4 py-1 border rounded border-gray-300 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="min-w-[100px] px-4 py-1 bg-green-600 text-white rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
