import React, { useState } from 'react';
import { FileText, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { commonSelectProps } from '../../utils/CommonCSS';
import api from '../../api/apiCall';
import { useToast } from '../../context/toastProvider';

// Helper function to generate a unique RMA ID
const generateRmaId = () => `RMA-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const InitiateRmaForm = ({ onRmaSubmit }) => {
    // State for Item Lookup and UI Flow
    const [itemDetails, setItemDetails] = useState(null); // Stores successful item data
    const [isLoadingItem, setIsLoadingItem] = useState(false); // Tracks S/N lookup status
    const [fetchError, setFetchError] = useState(null); // Stores S/N lookup error message
    const [showManualForm, setShowManualForm] = useState(false); // Allows user to bypass lookup

    // Form Data State
    const [formData, setFormData] = useState({
        serialNumber: '',
        relation_engineer: '',
        site_incharge: '',
        rma_number: '',
        case_number: '',
        incident_id: '',
        fault_date: null,
        rma_date: new Date().toISOString().split('T')[0],
        new_serial_number: '',
        faultDescription: '',
        severity: '',
        resolution: 'Repair/Replacement requested.',
    });

    // General Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const addToast = useToast();

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If the Serial Number changes, reset the lookup status
        if (name === 'serialNumber') {
            setItemDetails(null);
            setFetchError(null);
            setShowManualForm(false);
        }
    };

    const handleSelectChange = (selectedOption, actionMeta) => {
        const name = actionMeta?.name || actionMeta;
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
    };

    const fetchItemDetails = async (e) => {
        // Only run onBlur or Enter press in the field
        if (e.type === 'blur' || (e.key && e.key !== "Enter")) {
            return;
        }

        const serialNum = formData.serialNumber.trim();
        setFetchError(null); // Clear previous errors
        setItemDetails(null); // Clear previous details
        setShowManualForm(false); // Reset manual override

        if (!serialNum) {
            addToast({ message: "Please enter a Serial Number.", type: "warning" });
            return;
        }

        setIsLoadingItem(true);

        try {
            const response = await api.get(`/api/tracking/serial/${serialNum}`);
            const itemData = response.data.data.po_item;

            if (itemData) {
                setItemDetails(itemData);
                setFetchError(null);

                // Pre-fill form fields using the retrieved data
                setFormData(prev => ({
                    ...prev,
                }));
            } else {
                // Item not found
                setItemDetails(null);
                setFetchError(`No product inventory record found for Serial Number: ${serialNum}.`);
                addToast({ message: `S/N not found.`, type: "info" });
            }
        } catch (err) {
            // API failed (404, 500, network error)
            setItemDetails(null);
            setFetchError(`Error: ${err.response?.data?.message || 'Could not connect to service. Check network or API details.'}`);
            addToast({ message: `Error fetching details.`, type: "error" });
        } finally {
            setIsLoadingItem(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        // Basic validation check
        if (!itemDetails && !showManualForm) {
            addToast({ message: "Please resolve the Serial Number issue or use Manual Entry.", type: "error" });
            setIsSubmitting(false);
            return;
        }

        // ** Simulating API Call **
        setTimeout(() => {
            const newRma = {
                id: generateRmaId(),
                ...formData,
                relation_engineer: formData.relation_engineer?.value || null,
                site_incharge: formData.site_incharge?.value || null,
                severity: formData?.severity?.value || null,
                resolution: formData.resolution?.value || null,
                
                status: 'Pending Review',
                dateRequested: new Date().toISOString().split('T')[0],
                trackingNumber: null,
                itemSourceDetails: itemDetails || 'Manual Entry',
            };

            //onRmaSubmit(newRma);
            console.log(newRma);

            // Reset Form and State
            setFormData({
                serialNumber: '',
                relation_engineer: { value: null, label: null },
                site_incharge: { value: null, label: null },
                incident_id: '',
                rma_number: '',
                case_number: '',
                fault_date: null,
                rma_date: new Date().toISOString().split('T')[0],
                new_serial_number: '',
                faultDescription: '',
                severity: '',
                resolution: 'Repair/Replacement requested.',
            });
            setItemDetails(null);
            setShowManualForm(false);
            setFetchError(null);

            setMessage(`RMA Request ${newRma.id} initiated successfully! Please save this ID for future reference.`);
            setIsSubmitting(false);

            // Clear message after 5 seconds
            setTimeout(() => setMessage(''), 10000);
        }, 1000); // Simulate network delay
    };

    // Determine if the main form section should be visible
    const isFormUnlocked = itemDetails || showManualForm;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Initiate New RMA Request
            </h2>

            {message && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                    {message}
                </div>
            )}

            {/* Added max height and overflow-y-auto for scrolling */}
            <div className="overflow-y-auto max-h-[57.5vh] pr-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* --- 1. SERIAL NUMBER LOOKUP (GATEKEEPER) --- */}
                    <div className="md:col-span-2 border-b pb-4">
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            1. Enter Serial Number *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="serialNumber"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleInputChange}
                                onBlur={fetchItemDetails}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchItemDetails(e); } }}
                                required
                                readOnly={isSubmitting}
                                //disabled={isSubmitting}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 pr-10"
                                placeholder="Enter Serial Number and hit Enter"
                            />
                            {isLoadingItem && (
                                <Loader className="animate-spin w-5 h-5 text-blue-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                            )}
                            {itemDetails && !isLoadingItem && (
                                <CheckCircle className="w-5 h-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                            )}
                        </div>
                    </div>

                    {/* --- FEEDBACK / ERROR SECTION --- */}
                    {fetchError && !isLoadingItem && (
                        <div className="md:col-span-2 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded mb-4 shadow-sm">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <p className="font-semibold">S/N Lookup Failed:</p>
                            </div>
                            <p className="text-sm ml-7">{fetchError}</p>

                            {/* Manual Override Option */}
                            <button
                                type="button"
                                onClick={() => { setShowManualForm(true); setFetchError(null); }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline ml-7"
                            >
                                &rarr; **Continue to Manual RMA Entry**
                            </button>
                        </div>
                    )}

                    {itemDetails && (
                        <div className="md:col-span-2 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded shadow-sm">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <p className="font-semibold">Item Found:</p>
                            </div>
                            <p className="text-sm ml-7">
                                **Type:** {itemDetails.item_type_name || 'N/A'} | **Make:** {itemDetails.item_make_name || 'N/A'} | **Model:** {itemDetails.item_model_name || 'N/A'} | **Part:** {itemDetails.item_part_code || 'N/A'}
                            </p>
                        </div>
                    )}


                    {/* --- 2. RMA DETAILS (CONDITIONAL SECTION) --- */}
                    {isFormUnlocked && (
                        <>
                            <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-t pt-4">2. Item and Fault Details</h3>
                            {/* RE name */}
                            <div>
                                <label htmlFor='Relation Engineer' className='block text-sm font-medium text-gray-700 mb-1'>Relation Engineer *</label>
                                <AsyncSelect
                                    cacheOptions
                                    id='Relation Engineer'
                                    name='relation_engineer'
                                    value={formData.relation_engineer}
                                    onChange={handleSelectChange}
                                    loadOptions={async (inputValue) => {
                                        if (inputValue.length <= 2) {
                                            return Promise.resolve([]);
                                        }
                                        return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
                                            .then(response => response.data.data.map(u => ({ value: u.user_id, label: u.user_name })))
                                            .catch(err => { addToast(err); return Promise.resolve([]); });
                                    }}
                                    className="w-full"
                                    placeholder="Search & Select Relation Engineer"
                                    isClearable
                                    required
                                    {...commonSelectProps}
                                />
                            </div>

                            {/* Site Incharge (Always editable) */}
                            <div>
                                <label htmlFor='Site Incharge' className='block text-sm font-medium text-gray-700 mb-1'>Site Incharge *</label>
                                <AsyncSelect
                                    cacheOptions
                                    id='Site Incharge'
                                    name='site_incharge'
                                    value={formData.site_incharge}
                                    onChange={handleSelectChange}
                                    loadOptions={async (inputValue) => {
                                        if (inputValue.length <= 2) {
                                            return Promise.resolve([]);
                                        }
                                        return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
                                            .then(response => response.data.data.map(u => ({ value: u.user_id, label: u.user_name })))
                                            .catch(err => { addToast(err); return Promise.resolve([]); });
                                    }}
                                    className="w-full"
                                    placeholder="Search & Select Site Incharge"
                                    isClearable
                                    required
                                    {...commonSelectProps}
                                />
                            </div>
                            <div>
                                <label htmlFor="RMA Number" className="block text-sm font-medium text-gray-700 mb-1">RMA Number *</label>
                                <input
                                    type="text"
                                    id="RMA Number"
                                    name="rma_number"
                                    value={formData.rma_number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., R123345"
                                />
                            </div>
                            <div>
                                <label htmlFor="Case Number" className="block text-sm font-medium text-gray-700 mb-1">Case Number *</label>
                                <input
                                    type="text"
                                    id="Case Number"
                                    name="case_number"
                                    value={formData.case_number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., 1234-5678-90123"
                                />
                            </div>

                            {/* Incident ID */}
                            <div>
                                <label htmlFor="Incident ID" className="block text-sm font-medium text-gray-700 mb-1">Incident ID *</label>
                                <input
                                    type="text"
                                    id="Incident ID"
                                    name="incident_id"
                                    value={formData.incident_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., IM12345678"
                                />
                            </div>

                            {/* faulty date And RMA Date */}
                            <div>
                                <label htmlFor="Fault Date" className="block text-sm font-medium text-gray-700 mb-1">Fault Date *</label>
                                <input
                                    type="date"
                                    id="Fault Date"
                                    name="fault_date"
                                    value={formData.fault_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., DD-MM-YYYY"
                                />
                            </div>
                            <div>
                                <label htmlFor="RMA Date" className="block text-sm font-medium text-gray-700 mb-1">RMA Date *</label>
                                <input
                                    type="date"
                                    id="RMA Date"
                                    name="rma_date"
                                    value={formData.rma_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., DD-MM-YYYY"
                                />
                            </div>
                            
                            {/* New serial number optional */}
                            <div>
                                <label htmlFor="New Serial Number" className="block text-sm font-medium text-gray-700 mb-1">New Serial Number</label>
                                <input
                                    type="text"
                                    id="New Serial Number"
                                    name="new_serial_number"
                                    value={formData.new_serial_number}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="e.g., SN12345678"
                                />
                            </div>

                            {/* Resolution Type (Always editable) */}
                            <div className="md:col-span-1">
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <Select
                                    name="severity"
                                    className="w-full  focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150"
                                    options={[{ value: 'Critical', label: 'Critical' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Minor', label: 'Minor' }]}
                                    value={ formData.severity }
                                    onChange={(option) => handleSelectChange(option, 'severity')}
                                    isClearable
                                    {...commonSelectProps}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">Requested Resolution</label>
                                <Select
                                    name="resolution"
                                    value={ formData.resolution }
                                    onChange={(option) => handleSelectChange(option, 'resolution')}
                                    className="w-full focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150"
                                    isClearable
                                    options={[{value: 'Replacement', label: 'Replacement'}, {value: 'Repair', label: 'Repair'}, {value: 'Return/Refund', label: 'Return/Refund'}]}
                                    {...commonSelectProps}
                                />
                            </div>

                            {/* Fault Description (Always editable) */}
                            <div className="md:col-span-2">
                                <label htmlFor="faultDescription" className="block text-sm font-medium text-gray-700 mb-1">Detailed Fault Description</label>
                                <textarea
                                    id="faultDescription"
                                    name="faultDescription"
                                    value={formData.faultDescription}
                                    onChange={handleInputChange}
                                    required
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    placeholder="Describe the issue, when it occurred, and any troubleshooting steps taken."
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition duration-300 ease-in-out shadow-md ${isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
                                        }`}
                                >
                                    {isSubmitting ? 'Submitting Request...' : 'Submit RMA Request'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default InitiateRmaForm;