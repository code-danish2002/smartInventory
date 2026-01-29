import { useState, useCallback } from 'react';
import api from '../api/apiCall.js';
import { useToast } from '../context/toastProvider.jsx';

export const useTableActions = (refreshData) => {
    const addToast = useToast();
    // Consolidated modal state
    const [modalState, setModalState] = useState({
        type: null, // 'inspection', 'dispatch', 'upload', 'acceptance', 'poEdit', 'main'
        isOpen: false,
        data: null,
        extra: null, // For additional params like po_id, po_number, etc.
        tableName: null,
    });

    const [rowSelection, setRowSelection] = useState({
        selectedIds: [],
        selectionModel: { type: 'include', ids: new Set() },
        status: null,
    });

    const closeModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const openModal = useCallback((type, data = null, extra = null, tableName = null) => {
        setModalState({ type, isOpen: true, data, extra, tableName });
    }, []);

    const handleAction = useCallback((actionType, row, extraData = {}) => {
        const { field, title, tableName } = extraData;
        const currentTitle = title || tableName || '';

        switch (actionType) {
            case 'line-item-inspection':
                openModal('inspection', row, { po_id: row.po_id }, currentTitle);
                break;
            case 'dispatch-po':
                openModal('dispatch', row, { po_id: row.po_id }, currentTitle);
                break;
            case 'acceptance':
                openModal('acceptance', row, { po_id: row.po_id }, currentTitle);
                break;
            case 'upload_pdf':
                openModal('upload', row, { po_id: row.po_id, po_number: row.po_number }, currentTitle);
                break;
            case 'PO Re-Fills':
            case 'add-item-details':
                api.get(`/api/fullPoDataByPoId/${row.po_id}`)
                    .then(response => {
                        openModal('poEdit', response.data.data, { task: actionType === 'PO Re-Fills' ? 'Update Inspection' : 'Add Item Details' }, currentTitle);
                    })
                    .catch(error => {
                        console.error('Error fetching PO data:', error);
                        addToast(error);
                    });
                break;
            case 'view':
            case 'view-status':
                // For 'view', we need the sub-table name (currentTitle) and the row data as params
                openModal('main', { params: row, table: currentTitle, parentRow: row }, { type: actionType }, currentTitle);
                break;
            case 'edit-project-number':
                openModal('main', { body: row }, { type: actionType }, currentTitle);
                break;
            case 'update':
            case 'delete':
                // For Master Data, 'data' should include 'params' which contains the row's identifying keys
                openModal('main', { params: row }, { type: actionType }, currentTitle);
                break;
            default:
                openModal('main', row, { type: actionType }, currentTitle);
                break;
        }
    }, [openModal]);


    const clearSelection = useCallback(() => {
        setRowSelection({
            selectedIds: [],
            selectionModel: { type: 'include', ids: new Set() },
            status: null,
        });
    }, []);

    return {
        modalState,
        closeModal,
        openModal,
        handleAction,
        rowSelection,
        setRowSelection,
        clearSelection
    };
};