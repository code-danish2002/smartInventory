import React, { useEffect, useMemo, useState } from 'react';
import getEndpoint from '../utils/endpoints.jsx';
import { MyInput, MySelect } from '../elements.jsx';
import Select from 'react-select';
import api from '../api/apiCall.js';
import { useToast } from '../context/toastProvider.jsx';
import { OnSubmitLoading } from '../utils/icons.jsx';
import AsyncSelect from "react-select/async";

const AddSubItem = ({ subItemName, operation, defaultValues, onCancel, AfterAction }) => {
    const [subItemDetails, setSubItemDetails] = useState({ ...defaultValues });
    const [loading, setLoading] = useState(false);
    const addToast = useToast();

    const elements = useMemo(() => getEndpoint(subItemName, operation, 'body'), [subItemName, operation]);

    const url = useMemo(() => getEndpoint(subItemName, operation, 'url', defaultValues), [subItemName, operation]);

    const params = useMemo(() => getEndpoint(subItemName, operation, 'params')
        .reduce((acc, param) => {
            acc[param] = subItemDetails[param];
            return acc;
        }, {}), [subItemName, operation]);

    const body = useMemo(() => elements.reduce((acc, key) => {
        acc[key.name] = subItemDetails[key.name];
        return acc;
    }, {}), [elements, subItemDetails]);

    const [options, setOptions] = useState({
        item_type_id: [],
        item_make_id: [],
        item_model_id: [],
    });

    useEffect(() => {
        if (subItemName === 'Make') {
            api.get('/api/item-type', { params: { page: 1, limit: 0 } }).then((response) => {
                const itemTypes = response.data.data.map((item) => ({
                    value: item.item_type_id,
                    label: item.item_type_name,
                }))
                setOptions((prev) => ({ ...prev, item_type_id: itemTypes }));
            })
        }

        if (subItemName === 'Model') {
            api.get('/api/item-make', { params: { page: 1, limit: 0 } }).then((response) => {
                const itemMakes = response.data.data.map((item) => ({
                    value: item.item_make_id,
                    label: item.item_make_name,
                }))
                setOptions((prev) => ({ ...prev, item_make_id: itemMakes }));
            })
        }

        if (subItemName === 'Part') {
            api.get('/api/item-model', { params: { page: 1, limit: 0 } }).then((response) => {
                const itemModels = response.data.data.map((item) => ({
                    value: item.item_model_id,
                    label: item.item_model_name,
                }))
                setOptions((prev) => ({ ...prev, item_model_id: itemModels }));
            })
        }
    }, [subItemName]);

    //console.log('subItemDetails', subItemDetails, 'options', options,);

    async function handleSubmit(e) {
        e.preventDefault();
        const thisOperation = operation === 'create' ? 'post' : 'put';
        setLoading(true);
        try {
            const response = await api[thisOperation](url, body, { params });
            console.log('response', response);
            addToast(response);
            AfterAction();
        } catch (error) {
            addToast(error);
        } finally {
            setLoading(false);
            onCancel();
        }
    }

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
    const handleAsyncSelectChange = (selectedOption, element) => {
        console.log('option', selectedOption, options, subItemDetails);
        setSubItemDetails({ ...subItemDetails, [element.name]: selectedOption?.value, [(element.name).split('_')[0] + '_name']: selectedOption?.label }); // Removed trailing (option)
        setOptions((prev) => ({
            ...prev,
            [element.name]: selectedOption ? [...(prev[element.name] || []), selectedOption] : prev[element.name],
        }));
    }
    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 w-full mb-6 p-4 border rounded-lg bg-gray-50">
            {elements.map((element, index) => (
                <div key={index} className="flex flex-col gap-2 mb-4">
                    <label className="block text-sm font-medium text-gray-900">{element.label}</label>
                    {element.element === 'input' ? (
                        <MyInput
                            property={element}
                            value={subItemDetails[element.name] || ''}
                            handleInputChange={(name, value) => setSubItemDetails({ ...subItemDetails, [name]: value })}
                        />
                    ) : element.element === 'async-select' ? (
                        <AsyncSelect
                            cacheOptions
                            loadOptions={async (inputValue) => {
                                if (inputValue.length <= 2) {
                                    return Promise.resolve([]);
                                }
                                if (element.name === 'pop_id') {
                                    return api.get('/api/pops/searchByPopName', { params: { search: inputValue } })
                                        .then(response => response.data.data.map(p => ({ value: p.pop_id, label: p.pop_name })))
                                        .catch(err => { addToast(err); return Promise.resolve([]); });
                                } else {
                                    return Promise.resolve([]);
                                }
                            }}
                            value={{ value: subItemDetails['pop_id'] || null, label: subItemDetails['pop_name'] || null }}
                            onChange={(option) => {
                                handleAsyncSelectChange(option, element); // Removed trailing (option)
                            }}
                            id={element.name}
                            name={element.name}
                            isClearable
                            isDisabled={element.isDisabled}
                            placeholder={element.placeholder || 'Type & Select Name'}
                            className="mt-1 basic-multi-select min-w-36"
                            classNamePrefix="select"
                            maxMenuHeight={200}  // Maximum height before scrolling starts
                            menuPlacement="auto" // Smart positioning
                            {...commonSelectProps}
                        />
                    ) : element.element === 'select' ? (
                        <Select
                            options={options[element.name] || []}
                            value={options[element.name]?.find((option) => option.value === subItemDetails[element.name]) || null}
                            onChange={selectedOption => setSubItemDetails({ ...subItemDetails, [element.name]: selectedOption?.value })}
                            id={element.name}
                            name={element.name}
                            isClearable={true}
                            isDisabled={element.isDisabled}
                            className="mt-1 basic-multi-select min-w-36"
                            classNamePrefix="select"
                            maxMenuHeight={200}  // Maximum height before scrolling starts
                            menuPlacement="auto" // Smart positioning
                            {...commonSelectProps}
                        />
                    ) : null}
                </div>
            ))}
            <div className="flex justify-end w-full">
                <button
                    type="button"
                    onClick={onCancel}
                    className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`inline-flex items-center justify-center px-6 py-2 ${loading ? 'bg-blue-300 opacity-50 cursor-not-allowed' : 'bg-blue-400'} text-white font-semibold rounded-lg hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    disabled={loading}
                >
                    {loading ? <OnSubmitLoading /> : 'Submit'}
                </button>
            </div>
        </form>
    );
};

export default AddSubItem;