// src/hooks/useModalLogic.js
import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiCall.js';
import getEndpoint from '../utils/endpoints.jsx';
import { useToast } from '../context/toastProvider.jsx';
import { extractResponseInfo } from '../utils/responseInfo.js';
import { downloadPDF } from '../utils/downloadResponsePdf.js';

const VIEW_TYPES = ['view', 'view-status'];

export const useModalLogic = ({ type, modalName, data, isOpen, onAction, onClose }) => {
    const addToast = useToast();
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Submission Logic (handleSubmit) ---
    const handleSubmit = useCallback(async (body, operationOverride = type) => {
        setSubmitLoading(true);
        const requestFor = modalName;
        const params = data?.params || null;
        const method = operationOverride;

        const thisMethod = method === 'create' ? 'post' :
            method === 'update' ? 'put' :
                method === 'upload_pdf' ? 'post' :
                    method === 'request-approval' ? 'post' :
                        method === 'delete' ? 'delete' :
                            'post'; // Default to post for safety

        const expectsPdf = type === 'request-approval';
        const config = { ...(expectsPdf ? { responseType: 'arraybuffer' } : {}) };

        let thisParams = params;
        if (method === 'delete') {
            const paramKeys = getEndpoint(requestFor, method, 'params', params) || [];
            thisParams = paramKeys.reduce((acc, key) => {
                if (params && params[key] !== undefined) acc[key] = params[key];
                return acc;
            }, {});
        }

        const thisEndpoint = getEndpoint(requestFor, method, 'url', thisParams);

        try {
            let resp;
            if (method === 'delete') {
                resp = await api.delete(thisEndpoint, { params: thisParams });
            } else {
                resp = await api[thisMethod](thisEndpoint, body, { params: thisParams, ...config });
            }

            if (resp?.headers['content-type'] === 'application/pdf' && expectsPdf) {
                const { filename } = extractResponseInfo(resp, 'Approval Certificate.pdf');
                downloadPDF(resp.data, filename);
                addToast({ response: { statusText: 'Approval Certificate Generated!' }, type: 'success', status: '200' });
            } else {
                addToast(resp);
            }

            onAction();
        } catch (err) {
            console.error(err);
            addToast(err);
        } finally {
            setSubmitLoading(false);
            onClose();
        }
    }, [type, modalName, data, onAction, onClose, addToast]);

    // --- Data Fetching Logic (fetchViewData) ---
    const fetchViewData = useCallback(async ({ resetPage = false, tableOverride = null, paramsOverride = null } = {}) => {
        const requestFor = tableOverride ?? modalName ?? null;
        if (!requestFor || !VIEW_TYPES.includes(type)) return;

        const method = 'get';
        const allParams = paramsOverride ?? data?.params ?? {};
        const myParamKeys = getEndpoint(requestFor, method, 'params', {}) || [];
        const pageToRequest = resetPage ? 1 : (currentPage + 1);

        const thisParams = myParamKeys.reduce((acc, key) => {
            if (allParams[key] !== undefined) acc[key] = allParams[key];
            return acc;
        }, { page: pageToRequest, pageSize, search: searchQuery });

        // Ensure identifiers are present even if not in 'params' list of getEndpoint
        // This is a safety net for views that require specific IDs
        const identifyingKeys = [
            'po_id', 'po_line_item_id', 'po_item_details_id',
            'store_id', 'firm_id', 'item_type_id', 'item_make_id', 'item_model_id', 'item_part_id', 'user_id'
        ];
        identifyingKeys.forEach(key => {
            if (allParams[key] !== undefined) thisParams[key] = allParams[key];
        });

        const endpoint = getEndpoint(requestFor, method, 'url', thisParams);

        try {
            setModalLoading(true);
            setFetchError(false);

            const resp = await api.get(endpoint, { params: thisParams });
            const apiData = resp?.data?.data || [];
            setModalData(apiData);
            setTotal(resp.data?.pagination?.total || apiData.length);
            if (resp.data?.pagination?.page) {
                setCurrentPage(resp.data.pagination.page - 1);
            } else if (resetPage) {
                setCurrentPage(0);
            }
        } catch (err) {
            console.error("fetchViewData error", err);
            addToast(err);
            setModalData([]);
            setFetchError(true);
        } finally {
            setModalLoading(false);
        }
    }, [data, currentPage, pageSize, searchQuery, addToast, modalName, type]);

    // Effect for fetching data
    useEffect(() => {
        if (isOpen && VIEW_TYPES.includes(type)) {
            fetchViewData();
        } else if (!isOpen) {
            setModalData(null);
            setCurrentPage(0);
            setPageSize(10);
            setTotal(0);
            setSearchQuery('');
        }
    }, [isOpen, type, fetchViewData]);

    return {
        modalData,
        modalLoading,
        fetchError,
        submitLoading,
        currentPage,
        pageSize,
        total,
        searchQuery,
        setSearchQuery,
        handleSubmit,
        fetchViewData,
        setCurrentPage,
        setPageSize,
    };
};