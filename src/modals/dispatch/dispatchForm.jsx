import { useState, useMemo } from 'react';
import api from '../../api/apiCall';
import { List, Loader2, MapPin, Send, Users, X } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import { commonSelectProps } from '../../utils/CommonCSS';
import Select from 'react-select';

let dispatchIdCounter = 1000;
const getNextDispatchId = () => dispatchIdCounter++;
const ItemDispatchForm = ({
    lineItem,
    initialDispatch = null,
    onSave,
    onCancel,
    availableQuantity,
    availableSerialNumbers,
    phaseName,
}) => {
    const [formData, setFormData] = useState({
        quantity: initialDispatch?.quantity || '',
        phase: initialDispatch?.phase || '',
        location: initialDispatch?.location || '',
        owner: initialDispatch?.owner || '',
        assignedSerials: initialDispatch?.assignedSerials || [],
    });

    const [selectedSerialNumbers, setSelectedSerialNumbers] = useState(
        initialDispatch?.selectedSerialNumbers || []
    );

    const isEditMode = !!initialDispatch;
    const maxQuantity = isEditMode ? availableQuantity + initialDispatch.quantity : availableQuantity;

    const isStore = formData.phase === 'Store';
    const isSite = formData.phase === 'Site';
    const isLocationRequired = isStore || isSite;

    const phaseConfig = useMemo(() => {
        switch (phaseName) {
            case "At Store":
                return { Store: true, Site: true, Spare: false, Live: false };
            case "On Site":
                return { Store: true, Site: true, Spare: true, Live: true };
            case "Live":
                return { Store: true, Site: true, Spare: false, Live: false };
            case "OEM Spare":
                return { Store: true, Site: true, Spare: true, Live: true };
            case "Approve PO":
                return { Store: true, Site: true, Spare: false, Live: false };
            default: // Inspection
                return { Store: true, Site: true, Spare: false, Live: false };
        }
    }, [phaseName]);


    const loadLocationOptions = async (inputValue) => {
        if (inputValue.length <= 2) return [];
        if (isStore) {
            return api.get('/api/stores/searchByStoreName', { params: { search: inputValue } })
                .then(res => res.data.data.map(s => ({ value: s.store_id, label: s.store_name })));
        }
        if (isSite) {
            return api.get('/api/pops/searchByPopName', { params: { search: inputValue } })
                .then(res => res.data.data.map(p => ({ value: p.pop_id, label: p.pop_name })));
        }
        return [];
    };

    const loadOwnerOptions = async (inputValue, location) => {
        if (!location) return [];
        if (inputValue.length <= 2) return [];

        return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
            .then(res => res.data.data.map(u => ({ value: u.user_id, label: u.user_name })));
    };

    const loadSerialNumbersOptions = (inputValue) => {
        // Filter the full list of available SNs based on input
        // Include currently selected SNs in the options list for re-selection/removal
        const allOptions = availableSerialNumbers.map(sn => ({
            value: sn.po_item_details_id, // assuming this is the unique ID
            label: sn.item_serial_number, // the actual serial number string
            isCurrentlySelected: !!selectedSerialNumbers.find(s => s.value === sn.po_item_details_id)
        }));

        if (!inputValue) return allOptions;

        return allOptions.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    // Modified handleChange function
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            let newFormData = { ...prev, [name]: value };

            // --- Logic to handle Phase change and clear Location/Owner ---
            if (name === 'phase' && value !== prev.phase) {

                // Determine the requirement for the NEW phase
                const newIsStore = value === 'Store';
                const newIsSite = value === 'Site';
                const newIsLocationRequired = newIsStore || newIsSite;

                // Determine the requirement for the OLD phase
                const prevIsStore = prev.phase === 'Store';
                const prevIsSite = prev.phase === 'Site';
                const prevIsLocationRequired = prevIsStore || prevIsSite;

                const isPhaseTypeChange = (newIsStore !== prevIsStore) || (newIsSite !== prevIsSite);

                if (
                    prevIsLocationRequired !== newIsLocationRequired || // Required status changed
                    (newIsLocationRequired && isPhaseTypeChange) // Still required, but type of location (Store/Site) changed
                ) {
                    newFormData.location = '';
                }
            }
            // --- End of Phase change logic ---

            return newFormData;
        });
    };

    const handleSerialNumberChange = (options) => {
        const newSerialNumbers = options || [];
        setSelectedSerialNumbers(newSerialNumbers);
        // Sync quantity with the count of selected serial numbers
        setFormData(prev => ({
            ...prev,
            assignedSerials: newSerialNumbers,
            quantity: newSerialNumbers.length
        }));
    };

    // ADDED: Function to handle quantity change and sync serial numbers
    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value) || '';

        if (newQuantity === '' || (newQuantity > 0 && newQuantity <= maxQuantity)) {
            setFormData(prev => {
                const currentAssigned = prev.assignedSerials;
                let newAssigned = currentAssigned;

                if (newQuantity > currentAssigned.length) {
                    // Extend: auto-select up to newQuantity from the available list (excluding those already assigned)
                    const available = availableSerialNumbers
                        .filter(sn => !currentAssigned.find(s => s.value === sn.value))
                        .slice(0, newQuantity - currentAssigned.length);
                    newAssigned = [...currentAssigned, ...available];
                } else if (newQuantity < currentAssigned.length) {
                    // Truncate
                    newAssigned = currentAssigned.slice(0, newQuantity);
                }

                return {
                    ...prev,
                    quantity: newQuantity,
                    assignedSerials: newAssigned // Update serials here
                };
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.quantity > 0 && formData.phase && (!isLocationRequired || (formData.location && formData.owner))) {
            onSave({
                ...initialDispatch,
                ...formData,
                quantity: parseInt(formData.quantity),
                id: isEditMode ? initialDispatch.id : getNextDispatchId(),
            });
        }
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150";
    const currentAssignedSerials = formData.assignedSerials;

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border border-gray-200 rounded-xl mt-4 space-y-3 shadow-inner">
            <h4 className="text-lg font-semibold text-blue-700">
                {isEditMode ? 'Edit Dispatch' : 'New Dispatch Request'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Quantity */}
                <div className="md:col-span-1">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                        <List className="w-4 h-4 mr-1 text-red-500" /> Quantity *
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={maxQuantity}
                        placeholder={`Max ${maxQuantity} available`}
                        className={`${inputClasses} ${formData.quantity > maxQuantity ? 'border-red-500' : ''}`}
                        required
                    />
                    {formData.quantity > maxQuantity && (
                        <p className="text-xs text-red-500 mt-1">Cannot exceed {maxQuantity} items.</p>
                    )}
                </div>

                <div className="md:col-span-1">
                    <label htmlFor="serialNumbers" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                        Serial Numbers ({selectedSerialNumbers.length}) *
                    </label>
                    <Select
                        // cacheOptions // Not needed for standard Select
                        options={loadSerialNumbersOptions()} // Provide all options
                        // loadOptions={loadSerialNumbersOptions} // Not needed
                        isMulti
                        isClearable={false}
                        placeholder="Select S. Nos"
                        value={currentAssignedSerials}
                        onChange={handleSerialNumberChange}
                        classNamePrefix="react-select"
                        className="w-full border-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        {...commonSelectProps}
                        styles={{
                            ...commonSelectProps.styles,
                            control: (base) => ({
                                ...base,
                                backgroundColor: base.backgroundColor,
                                cursor: base.cursor,
                                minHeight: '42px',
                                maxHeight: '70px',
                                overflowY: 'auto'
                            }),
                            option: (base) => ({
                                ...base,
                                cursor: base.cursor
                            })
                        }}
                    // maxMenuHeight={200} // Optional
                    />
                    {formData.quantity !== currentAssignedSerials.length && formData.quantity > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                            Quantity ({formData.quantity}) must match selected serial numbers ({currentAssignedSerials.length}).
                        </p>
                    )}
                </div>

                {/* Phase */}
                <div className="md:col-span-1">
                    <label htmlFor="phases" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                        <Loader2 className="w-4 h-4 mr-1 text-yellow-600" /> Phase *
                    </label>
                    <select
                        name="phase"
                        value={formData.phase}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    >
                        <option value="">Select Phase</option>
                        {['Store', 'Site', 'Spare', 'Live'].map(p => (
                            phaseConfig[p] ? (
                                <option key={p} value={p}>{p}</option>
                            ) : null
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div className="md:col-span-1">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                        <MapPin className="w-4 h-4 mr-1 text-green-600" /> Location *
                    </label>
                    {isLocationRequired ? (
                        <AsyncSelect
                            cacheOptions
                            loadOptions={loadLocationOptions}   // define below
                            isClearable
                            placeholder={isStore ? "Type Store Name" : "Type POP Name"}
                            value={formData.location}
                            onChange={(option) =>
                                setFormData(prev => ({ ...prev, location: option }))
                            }
                            classNamePrefix="react-select"
                            className="w-full border-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            {...commonSelectProps}
                            styles={{
                                ...commonSelectProps.styles,
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: base.backgroundColor,
                                    cursor: base.cursor,
                                    minHeight: '42px',
                                    maxHeight: '70px',
                                    overflowY: 'auto'
                                }),
                                option: (base) => ({
                                    ...base,
                                    cursor: base.cursor
                                })
                            }}
                        />
                    ) : (
                        <input
                            type="text"
                            disabled
                            value="Not Required"
                            className={`${inputClasses} bg-gray-100 text-gray-400`}
                        />
                    )}
                </div>

                {/* Owner */}
                <div className="md:col-span-1">
                    <label htmlFor="owner" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                        <Users className="w-4 h-4 mr-1 text-purple-600" /> Owner/Recipient *
                    </label>
                    {isLocationRequired ? (
                        <AsyncSelect
                            cacheOptions
                            loadOptions={(inputValue) => loadOwnerOptions(inputValue, formData.location)}
                            isClearable
                            placeholder={isStore ? "Type Incharge Name" : "Type Receiver Name"}
                            value={formData.owner}
                            onChange={(option) =>
                                setFormData(prev => ({ ...prev, owner: option }))
                            }
                            classNamePrefix="react-select"
                            className="w-full border-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                            {...commonSelectProps}
                            styles={{
                                ...commonSelectProps.styles,
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: base.backgroundColor,
                                    cursor: base.cursor,
                                    minHeight: '42px',
                                    maxHeight: '70px',
                                    overflowY: 'auto'
                                }),
                                option: (base) => ({
                                    ...base,
                                    cursor: base.cursor
                                })
                            }}
                        />
                    ) : (
                        <input
                            type="text"
                            disabled
                            value="Not Required"
                            className={`${inputClasses} bg-gray-100 text-gray-400`}
                        />
                    )}

                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
                >
                    <X className="w-4 h-4 mr-2" /> Cancel
                </button>
                <button
                    type="submit"
                    disabled={formData.quantity > maxQuantity || !formData.quantity || !formData.phase || (isLocationRequired && (!formData.location || !formData.owner)) || formData.quantity !== currentAssignedSerials.length}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-150 shadow-md"
                >
                    <Send className="w-4 h-4 mr-2" /> {isEditMode ? 'Update Dispatch' : 'Add Dispatch'}
                </button>
            </div>
        </form>
    );
};
export default ItemDispatchForm;