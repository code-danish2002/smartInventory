import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';
import AsyncSelect from 'react-select/async';
import { commonSelectProps } from '../utils/CommonCSS';

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



    return (
        <div className="modal-overlay">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md border dark:border-slate-800">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-slate-100">Update Project Number</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6 text-sm">
                    Enter the new Project Number for the <span className="font-bold text-gray-900 dark:text-slate-200">{selectedItems.length}</span> selected item(s).
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
                        className={`react-select-container w-full border border-gray-300 dark:border-slate-700 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-6`}
                        classNamePrefix="react-select"
                        placeholder="Search existing Project Numbers..."
                        {...commonSelectProps}
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-800 rounded-md hover:bg-gray-300 dark:hover:bg-slate-700 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-white bg-indigo-600 dark:bg-indigo-600 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-700 transition font-bold shadow-md shadow-indigo-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!newProjectNumber || loading}
                        >
                            {loading ? 'Updating...' : 'Apply Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectNumberEdit;