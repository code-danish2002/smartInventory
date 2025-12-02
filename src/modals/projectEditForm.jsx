import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';
import AsyncSelect from 'react-select/async';

const ProjectNumberEdit = ({ isOpen = true, onClose, onSubmit, selectedItems }) => {
    const [newProjectNumber, setNewProjectNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const addToast = useToast();
    if (!isOpen) return null;
    const fetchProjectNumber = async (inputValue) => {
        if (!inputValue) return [];
        const digits = String(inputValue).replace(/\D/g, '');
        if (digits.length < 2) return [];
        try {
            const response = await api.get(`/api/projects/searchByNumber`, { params: { project_number: inputValue } });
            const projectNumbers = response.data.data || [];
            return projectNumbers.map(num => ({
                value: Number(num),
                label: String(num),
            }));
        } catch (err) {
            console.error("Failed to fetch PO numbers:", err);
            addToast(err);
            return [];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newProjectNumber === null || loading) return;

        const body = {
            po_item_details_id: selectedItems,
            project_number: Number(newProjectNumber), // ensure number
        };
        setLoading(true);
        await api.put('/api/projects/updateProjectNumber', body).then((response) => {
            addToast(response);
            if (onSubmit) onSubmit();
        }).catch((error) => {
            console.error('Error updating project numbers:', error);
            addToast(error);
        }).finally(() => {
            setLoading(false);
            onClose();
        });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Update Project Number</h3>
                <p className="text-gray-600 mb-4">
                    Enter the new Project Number for the **{selectedItems.length}** selected item(s).
                </p>
                <form onSubmit={handleSubmit}>
                    <AsyncSelect
                        cacheOptions
                        loadOptions={fetchProjectNumber}
                        defaultOptions
                        name={"project_number"}
                        value={newProjectNumber !== null ? { value: newProjectNumber, label: String(newProjectNumber) } : null}
                        onChange={(option) => {
                            setNewProjectNumber(option ? Number(option.value) : null);
                        }}
                        isClearable
                        className={`react-select-container w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-6`}
                        classNamePrefix="react-select"
                        placeholder="Search existing Project Numbers..."
                        {...commonSelectProps}
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition"
                            disabled={!newProjectNumber || loading}
                        >
                            Apply Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectNumberEdit;