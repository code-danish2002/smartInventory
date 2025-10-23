import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';

const ProjectNumberEdit = ({ isOpen = true, onClose, onSubmit, selectedItems }) => {
    const [newProjectNumber, setNewProjectNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const addToast = useToast();
    if (!isOpen) return null;

    const body = {
        po_item_details_id: selectedItems,
        project_number: newProjectNumber.trim()
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newProjectNumber.trim() || loading) return;
        await api.put('/api/updateProjectNumber', body).then((response) => {
            addToast(response);
            if (onSubmit) onSubmit();
        }).catch((error) => {
            console.error('Error updating project numbers:', error);
            addToast(error);
        }).finally(() => {
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Update Project Number</h3>
                <p className="text-gray-600 mb-4">
                    Enter the new Project Number for the **{selectedItems}** selected item(s).
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newProjectNumber}
                        onChange={(e) => setNewProjectNumber(e.target.value)}
                        placeholder="New Project Number"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-6"
                        required
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
                            disabled={!newProjectNumber.trim()}
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