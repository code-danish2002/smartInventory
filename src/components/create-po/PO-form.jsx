// src/components/create-po/CreatePOModal.jsx
import { useState, useEffect, } from 'react';
import LineItemForm from './lineItemForm.jsx';
import api from '../../api/apiCall.js';
import { useAuth } from '../../context/authContext.jsx';
import { useToast } from '../../context/toastProvider.jsx';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { validateAddDataForm, validateInspectionForm } from '../../utils/validatePoForm.js';
import { downloadPDF } from '../../utils/downloadResponsePdf.js';
import { extractResponseInfo } from '../../utils/responseInfo.js';
import ErrorFloatingButton from '../../utils/errorFloatingButton.jsx';
import ErrorModal from '../../modals/errorModal.jsx';
import { useCurrentRender } from '../../context/renderContext.jsx';
import { Maximize2, Minimize2 } from 'lucide-react';
import { commonSelectProps } from '../../utils/CommonCSS.jsx';

const PurchaseOrderFormModal = ({ isOpen, onClose, defaultValues = {}, task = 'Create Inspection', onSuccess }) => {
    const [poDetails, setPoDetails] = useState({ ...(defaultValues || {}), po_created_at: new Date().toISOString().slice(0, 10) });
    const [assigneeUserId, setAssigneeUserId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [formError, setFormError] = useState({});
    const [showErrorModal, setShowErrorModal] = useState(false); // New
    const [isFullScreen, setIsFullScreen] = useState(false);
    const { handleSetCurrentRender } = useCurrentRender();

    const { name } = useAuth();
    const addToast = useToast();

    const myElements = [
        { name: 'po_number', label: 'PO Number', type: 'asyncSelect', isDisabled: false, isRequired: true, placeholder: 'Enter PO No.' },
        { name: 'inspector_id', label: 'Inspection Authority', type: 'asyncSelect', isDisabled: false, isRequired: true, placeholder: 'Type to search', },
        { name: 'po_description', label: 'PO Description', type: 'show', isDisabled: false, isRequired: true, placeholder: 'Enter PO Description' },
        { name: 'tender_number', label: 'Tender Number', type: 'show', isDisabled: true, isRequired: true, placeholder: 'TN12345' },
        { name: 'po_created_at', label: 'Date of Inspection', type: 'show', isDisabled: false, isRequired: true, placeholder: 'YYYY-MM-DD' },
        { name: 'po_date_of_issue', label: 'PO Date of Issue', type: 'show', isDisabled: true, isRequired: true, placeholder: 'YYYY-MM-DD' },
    ];

    const firmElements = [
        { name: 'firm_name', label: 'Firm Name', type: 'show', isDisabled: true, isRequired: true, placeholder: 'RCIL' },
        { name: 'firm_address', label: 'Firm Address', type: 'show', isDisabled: true, isRequired: true, placeholder: 'Delhi, India-110000', value: 'New Delhi' },
        { name: 'contact_person_name', label: 'Contact Person', type: 'show', isDisabled: true, isRequired: true, placeholder: 'John Doe', value: 'Danish' },
        { name: 'contact_number', label: 'Contact Number', type: 'show', isDisabled: true, isRequired: true, placeholder: '+91-1234567890', value: '1234567890' },
        { name: 'email_address', label: 'Email', type: 'show', isDisabled: true, isRequired: true, placeholder: 'john@example.com', value: '2i6lD@example.com' },
    ]

    const allSerials = poDetails.po_line_items?.flatMap(lineItem =>
        lineItem.po_item_details?.flatMap(itemDetail =>
            itemDetail.item_serial_number
        )
    );

    // Reset form when modal opens with new defaultValues
    useEffect(() => {
        if (isOpen) {
            setPoDetails({ ...(defaultValues || {}), po_created_at: new Date().toISOString().slice(0, 10) });
            //setFormLoading(true);
            setSubmitError(null);
            setFormError({});
            setShowErrorModal(false);
        }
    }, [isOpen, defaultValues]);

    const handlePoSelectChange = async (selectedOption, fieldName) => {
        const selectedValue = selectedOption?.value ?? '';
        const selectedLabel = selectedOption?.label ?? '';

        if (fieldName === 'po_number') {
            if (task !== 'Add Item Details' && task !== 'Update Inspection') {
                // Reset for a completely new PO in 'Create Inspection' flow
                setPoDetails({
                    po_created_at: new Date().toISOString().slice(0, 10),
                    po_number: selectedValue,
                    po_line_items: [],
                });

                if (selectedValue) {
                    try {
                        const response = await api.get(`/api/poCreatedData/${selectedValue}`);
                        // Merge new data but ensure a clean start for line items if required
                        setPoDetails(prev => ({
                            ...prev,
                            ...response.data.data,
                            tender_number: response.data.data.tender_no,
                            po_date_of_issue: response.data.data.po_date,
                            // Force the new line items from API when selecting a new PO
                            po_line_items: response.data.data.po_line_items.map(lineItem => ({
                                ...lineItem,
                                po_line_item_id: lineItem?.summary_id,
                                line_item_name: lineItem?.line_description,
                                description: lineItem?.item_description,
                                unit_measurement: lineItem?.unit_of_measure,
                                po_item_details: [],
                            }))
                                || [],
                        }));
                    } catch (error) {
                        addToast(error);
                        console.error('Error fetching PO data:', error);
                    }
                    finally {
                        setFormLoading(false);
                    }
                }
            } else {
                setPoDetails(prev => ({ ...prev, po_number: selectedValue }));
            }
        }
        else if (fieldName === 'inspector_id') {
            setPoDetails(prev => ({ ...prev, inspector_id: selectedValue, inspector_user: selectedLabel }));
        }
    };

    const fetchPoOptions = async (inputValue, field) => {
        // Only call the API if the input is at least 4 digits
        const url = field === 'po_number' ? '/api/poNumberData' : '/api/user-details/searchByUserName';
        const params = field === 'po_number' ? { po_number: inputValue } : { search: inputValue };
        const optionStructure = field === 'po_number' ? { value: 'po_number', label: 'po_number' } : { value: 'user_id', label: 'user_name' };
        if (inputValue.length >= 4) {
            try {
                const response = await api.get(url, { params });
                const data = response.data.data;
                return data.map(item => ({
                    value: item[optionStructure.value],
                    label: item[optionStructure.label],
                }));
            } catch (err) {
                console.error(`Failed to fetch ${field} options:`, err);
                addToast(err);
                return [];
            }
        }
        return [];
    };

    useEffect(() => {
        if (name) {
            //const fullName = name ? `${name}` : 'Unknown User';
            api.get(`/api/user-details-by-name/${name}`).then((response) => {
                const assigneeId = response.data.data.user_id;
                const assigneeName = response.data.data.user_name;
                setAssigneeUserId(assigneeId);
            }
            ).catch((error) => {
                console.error('Error fetching user details:', error);
                addToast(error);
            });
        }
    }, [name]);

    const handleConfirmSubmit = async (e, lineItems, esign) => {
        e.preventDefault();
        setFormLoading(true);

        // Validate form
        let errors = [];

        // Construct API body
        const apiBody = {
            po_number: poDetails?.po_number || '',
            po_description: poDetails?.po_description || '',
            firm_id: poDetails?.firm_id || null,
            tender_number: poDetails.tender_number,
            po_date_of_issue: poDetails.po_date_of_issue,
            purchaser_id: poDetails.purchaser_id || assigneeUserId || null,
            inspector_id: poDetails.inspector_id || null,
            pdf_sign_type: esign ? esign : "Physically_Sign",
            //line_items
            po_line_items: lineItems?.map(item => ({
                po_line_item_id: item.po_line_item_id,
                line_number: item.line_number || 0,
                line_item_name: item.line_item_name || '',
                total_quantity: item.total_quantity || 0,
                quantity_offered: item.quantity_offered || 0,
                description: item.description || '',
                unit_measurement: item.unit_measurement || '',
                unit_price: item.unit_price || 0,
                warranty_start: item.warranty_start || null,
                // items
                po_item_details: item?.items?.map(subItem => ({
                    po_item_details_id: subItem.po_item_details_id || 0,
                    item_type_id: subItem.item_type_id || 0,
                    item_make_id: subItem.item_make_id || 0,
                    item_model_id: subItem.item_model_id || 0,
                    item_part_id: subItem.item_part_id || 0,
                    quantity_inspected: subItem.quantity_inspected || 0,
                    item_serial_number: subItem.item_serial_number || [],
                    remarks: subItem.remarks || '',
                }))
            }))
        };

        console.log('API Body:', apiBody, assigneeUserId, poDetails.purchaser_id);
        if (task === 'Create Inspection' || task === 'Update Inspection') {
            errors = validateInspectionForm(apiBody);
        }
        if (task === 'Add Item Details' || task === 'Update Inspection') {
            errors = validateAddDataForm(apiBody);
        }

        if (Object.keys(errors.inputErrors).length) {
            console.log('Form validation errors:', errors, 'inputErrors:', errors.inputErrors);
            setFormError(errors.inputErrors ?? {});
            setFormLoading(false);
            addToast({ response: { statusText: Object.values(errors.inputErrors).join(', ') }, type: 'error', status: '400' });
            return;
        }
        if (errors.errors?.length) {
            setSubmitError(errors.errors ?? []);
            setFormLoading(false);
            return;
        }
        setSubmitError(null);

        // API call
        const method = task === 'Create Inspection' ? 'post' : 'put';
        const url = task === 'Create Inspection' ? '/api/pos' : task === 'Add Item Details' ? `/api/pos-dataEntry/${poDetails?.po_id}` : `/api/pos-correction/${poDetails?.po_id}`;
        const params = task === 'Create Inspection' ? {} : { po_id: poDetails?.po_id };

        const expectsPdf = task === 'Add Item Details' || task === 'Update Inspection';

        const config = {
            ...(expectsPdf ? { responseType: 'arraybuffer' } : {}),
        };

        console.log('API Call:', method.toUpperCase(), url, 'params:', params, 'body:', apiBody);

        try {
            const response = await api[method](url, apiBody, config);

            // Use Axios response handling
            if (response.headers['content-type'] === 'application/pdf' && task !== 'Create Inspection') {
                const { filename, message } = extractResponseInfo(response, 'Inspection Certificate.pdf');
                console.log(filename, message, response?.headers, response);
                downloadPDF(response.data, filename);
                addToast({ response: { statusText: 'Form Submitted!' }, type: 'success', status: '200' });
            } else {
                // Handle non-PDF responses, such as for 'Create Inspection' or 'po-correction' tasks
                addToast(response);
            }
            // Callback on success
            if (onSuccess) {
                onSuccess();
            }

            if (task === 'Create Inspection') {
                onClose();
            } else {
                // For Add Item Details or Update Inspection, navigate back to the grid
                onClose();
            }

        } catch (error) {
            addToast(error);
        } finally {
            setFormLoading(false);
            handleSetCurrentRender('Dashboard');
        }
    };
    console.log(poDetails);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`relative ${isFullScreen ? 'w-screen h-screen' : 'w-full max-w-[90vw] h-[90vh]'} overflow-hidden bg-white rounded-lg shadow-xl`}>
                <div className='flex flex-row justify-between p-4 border-b bg-gray-50'>
                    <h2 className="text-2xl font-semibold">{task}</h2>
                    <div className="absolute top-4 right-4 z-10 flex space-x-2">
                        <button
                            onClick={() => setIsFullScreen((f) => !f)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded"
                            aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="h-[80vh] overflow-auto">
                    <div className="relative w-full bg-white rounded h-full overflow-auto max-w-[100vw]">
                        <div className="flex justify-center my-2 px-4">
                            <div className="w-full">
                                {/* Static Form Section */}
                                <div className="w-full flex flex-col xl:flex-row mb-8 gap-4">
                                    {/* First section for PO details */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-4 border rounded-md shadow">
                                        {myElements.map((element, index) => (
                                            <div key={index} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {element.label}
                                                </label>

                                                {element.type === 'asyncSelect' ? (
                                                    <AsyncSelect
                                                        cacheOptions
                                                        loadOptions={(inputValue) => fetchPoOptions(inputValue, element.name)}
                                                        defaultOptions
                                                        name={element.name}
                                                        value={
                                                            element.name === 'inspector_id' ?
                                                                poDetails?.inspector_id ? { value: poDetails.inspector_id, label: poDetails.inspector_user } : null
                                                                : poDetails?.[element.name] ? { value: poDetails[element.name], label: poDetails[element.name] } : null
                                                        }
                                                        onChange={(selectedOption) => handlePoSelectChange(selectedOption, element.name)}
                                                        isClearable={task === 'Create Inspection'}
                                                        isSearchable={task === 'Create Inspection'}
                                                        className={`react-select-container mt-1 w-full ${element.isDisabled ? 'pointer-events-none' : ''} ${formError?.[element.name] ? 'border-red-500' : ''}`}
                                                        classNamePrefix="react-select"
                                                        placeholder={element.placeholder}
                                                        isDisabled={element.isDisabled}
                                                        {...commonSelectProps}
                                                    />
                                                ) :
                                                    element.type === 'select' ? (
                                                        <>
                                                            <Select
                                                                options={options[element.name] || []}
                                                                name={element.name}
                                                                value={
                                                                    options?.[element.name]?.find(
                                                                        (opt) => opt.value === poDetails[element.name]
                                                                    )
                                                                    || null
                                                                }
                                                                onChange={(e) => {
                                                                    if (task !== 'Add Item Details') {
                                                                        setPoDetails({
                                                                            ...poDetails,
                                                                            [element.name]: e?.value ?? '',
                                                                        });
                                                                    }
                                                                }
                                                                }
                                                                isClearable={task === 'Create Inspection'}
                                                                isSearchable={task === 'Create Inspection'}
                                                                className={`react-select-container mt-1 w-full ${element.isDisabled ? 'pointer-events-none' : ''} ${formError?.[element.name] ? 'border-red-500' : ''}`}
                                                                classNamePrefix="react-select"
                                                                placeholder={element.placeholder}
                                                                isDisabled={element.isDisabled || task !== 'Create Inspection'}
                                                                {...commonSelectProps}
                                                            />
                                                            {options[element.name]?.length === 0 && !formLoading ? (
                                                                <p className="text-red-500 text-sm mt-1">
                                                                    {element.label} is not available
                                                                </p>
                                                            ) : formError?.[element.name] ? (
                                                                <p className="text-red-500 text-sm mt-1">
                                                                    {formError?.[element.name]}
                                                                </p>
                                                            )
                                                                : (
                                                                    <p className="text-sm mt-1">&nbsp;</p>
                                                                )}
                                                        </>
                                                    ) : element.type === 'show' ? (
                                                        <p className="text-gray-800 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px] flex items-center overflow-auto scrolblbar-thin scrollbar-thumb-gray-300" style={{ scrollbarWidth: "thin", msOverflowStyle: "none" }}>
                                                            {poDetails?.[element.name] || `e.g. ${element.placeholder}`}
                                                        </p>
                                                    ) : (
                                                        <input
                                                            type={element.type === 'date' ? 'date' : 'text'}
                                                            value={poDetails?.[element.name] || ''}
                                                            onChange={(e) =>
                                                                setPoDetails({
                                                                    ...poDetails,
                                                                    [element.name]: e.target.value,
                                                                })
                                                            }
                                                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                            placeholder={element.placeholder}
                                                            readOnly={element.isDisabled}
                                                            required={element.isRequired}
                                                        />
                                                    )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Second section for Firm details */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 p-4 gap-4 mt-4 xl:mt-0 border rounded-md shadow">
                                        {firmElements.map((element, index) => (
                                            <div key={index} className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {element.label}
                                                </label>

                                                {element.type === 'select' ? (
                                                    <>
                                                        <Select
                                                            options={options[element.name] || []}
                                                            name={element.name}
                                                            value={
                                                                options[element.name]?.find(
                                                                    (opt) => opt.value === poDetails[element.name]
                                                                ) || null
                                                            }
                                                            onChange={(e) =>
                                                                setPoDetails({
                                                                    ...poDetails,
                                                                    [element.name]: e?.value ?? '',
                                                                })
                                                            }
                                                            isClearable
                                                            className="react-select-container mt-1 w-full"
                                                            classNamePrefix="react-select"
                                                            placeholder={element.placeholder}
                                                            isDisabled={element.isDisabled}
                                                            {...commonSelectProps}
                                                        />
                                                        {options[element.name]?.length === 0 && !formLoading ? (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                No {element.label} available
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm mt-1">&nbsp;</p>
                                                        )}
                                                    </>
                                                ) : element.type === 'show' ? (
                                                    <p className="text-gray-800 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[42px] flex items-center overflow-auto scrolblbar-thin scrollbar-thumb-gray-300" style={{ scrollbarWidth: "thin", msOverflowStyle: "none" }}>
                                                        {poDetails?.[element.name] || `e.g. ${element.placeholder}`}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <LineItemForm defaultValues={poDetails?.po_line_items} onSubmit={handleConfirmSubmit} onCancel={onClose} loading={formLoading} task={task} existingSerialNumbers={allSerials} />
                                <ErrorModal showErrorModal={showErrorModal} setShowErrorModal={setShowErrorModal} submitError={submitError} />
                                <ErrorFloatingButton errorCount={submitError?.length} onClick={() => setShowErrorModal(true)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderFormModal;