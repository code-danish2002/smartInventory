// src/components/create-po/CreatePOModal.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../../api/apiCall.js';
import { useAuth } from '../../context/authContext.jsx';
import { useToast } from '../../context/toastProvider.jsx';
import { downloadPDF } from '../../utils/downloadResponsePdf.js';
import { extractResponseInfo } from '../../utils/responseInfo.js';
import InfoModal from '../../modals/InfoModal.jsx';
import { useCurrentRender } from '../../context/renderContext.jsx';
import { Maximize2, Minimize2, FileText, Send, Import, Loader2 } from 'lucide-react';
import HierarchyForm from './hierarchyForm.jsx';
import SerialNumberModal from './SerialNumberModal.jsx';
import PreviewModal from './PreviewModal.jsx';
import { handleSaveDraft, reconstructHierarchy } from '../../utils/poDraftUtils.js';
import { savePOSession, loadPOSession, clearPOSession, clearAllExpiredPOSessions } from '../../utils/poPersistenceUtils.js';
import POSelectionCard from './POSelectionCard.jsx';

const HierarchyPOFormModal = ({ isOpen, onClose, defaultValues = {}, task = 'Create Inspection', onSuccess }) => {
    const [poDetails, setPoDetails] = useState({ ...(defaultValues || {}), po_created_at: new Date().toISOString().slice(0, 10) });
    const [poData, setPoData] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [formError, setFormError] = useState({});
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [assigneeUserId, setAssigneeUserId] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);

    // Info Modal States
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoModalTitle, setInfoModalTitle] = useState('');
    const [infoModalData, setInfoModalData] = useState({});

    // Selection State
    const [selectedLineItemIds, setSelectedLineItemIds] = useState([]);

    // Hierarchy State (LIFTED)
    const [lineItemTrees, setLineItemTrees] = useState({});

    // Serial Number Modal State
    const [serialsModal, setSerialsModal] = useState({ isOpen: false, lineItemId: null, nodeId: null, serials: [], remarks: '', allowDuplicates: false, maxQty: 0 });

    // Preview Modal State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewPayload, setPreviewPayload] = useState(null);

    const { handleSetCurrentRender } = useCurrentRender();
    const { name } = useAuth();
    const addToast = useToast();

    console.log(defaultValues);

    // Reset form when modal opens with new defaultValues
    useEffect(() => {
        if (isOpen) {
            // Clear all expired cached data globally when the modal opens
            clearAllExpiredPOSessions();

            setPoDetails({ ...(defaultValues || {}), po_created_at: new Date().toISOString().slice(0, 10) });
            // If defaultValues already has PO info, set it to poData so hierarchy shows up
            if (defaultValues?.po_number) {
                setPoData(defaultValues);

                // Initialize Hierarchy Trees from defaultValues if they exist
                if (defaultValues.po_line_items) {
                    const initialTrees = {};
                    const initialSelectedIds = [];

                    const normalizedLineItems = defaultValues.po_line_items.map(li => ({
                        ...li,
                        summary_id: li.summary_id || li.po_line_item_id
                    }));

                    setPoDetails(prev => ({
                        ...prev,
                        po_line_items: normalizedLineItems
                    }));

                    normalizedLineItems.forEach(li => {
                        const lineItemId = li.summary_id;
                        initialSelectedIds.push(lineItemId);

                        initialTrees[lineItemId] = reconstructHierarchy(
                            li.sub_items || li.children || [],
                            li.po_item_details || li.item_details || [],
                            li.line_number,
                            null // Root level items have null sub_item_code
                        );
                    });

                    setLineItemTrees(initialTrees);
                    setSelectedLineItemIds(initialSelectedIds);
                }
            } else {
                setPoData(null);
                setLineItemTrees({});
                setSelectedLineItemIds([]);
            }
            setSubmitError(null);
            setFormError({});
            setShowErrorModal(false);

            // AUTO-RESTORE on Modal Open (if defaultValues has po_id)
            const poId = defaultValues?.po_id;
            if (poId) {
                const persisted = loadPOSession(poId);
                if (persisted) {
                    setPoDetails(persisted.poDetails);
                    setLineItemTrees(persisted.lineItemTrees);
                    setSelectedLineItemIds(persisted.selectedLineItemIds);
                }
            }
        }
    }, [isOpen, defaultValues]);

    // AUTO-SAVE Effect
    useEffect(() => {
        if (!isOpen || !poDetails?.po_id) return;

        const timer = setTimeout(() => {
            savePOSession(poDetails.po_id, {
                poDetails,
                lineItemTrees,
                selectedLineItemIds
            });
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [poDetails, lineItemTrees, selectedLineItemIds, isOpen]);

    useEffect(() => {
        if (name) {
            api.get(`/api/user-details-by-name/${name}`).then((response) => {
                const assigneeId = response.data.data.user_id;
                setAssigneeUserId(assigneeId);
            }
            ).catch((error) => {
                console.error('Error fetching user details:', error);
                addToast(error);
            });
        }
    }, [name]);

    const fetchOptions = async (inputValue, field) => {
        if (inputValue.length < 4) return [];
        const url = field === 'po_number' ? '/api/poNumberData' : '/api/user-details/searchByUserName';
        const params = field === 'po_number' ? { po_number: inputValue } : { search: inputValue };

        try {
            const response = await api.get(url, { params });
            const data = response.data.data;
            const list = Array.isArray(data) ? data : [data];

            return list.map(item => ({
                value: field === 'po_number' ? item.po_number : item.user_id,
                label: field === 'po_number' ? `${item.po_number}` : item.user_name,
                fullData: item
            }));
        } catch (err) {
            console.error(`Failed to fetch ${field} options: `, err);
            return [];
        }
    };

    const handlePoChange = useCallback(async (selectedOption) => {
        if (!selectedOption) {
            setPoData(null);
            setPoDetails(prev => ({ ...prev, po_number: '', po_line_items: [] }));
            return;
        }

        const poNumber = selectedOption.value;
        setFormLoading(true);
        try {
            const response = await api.get(`/api/poCreatedData/${poNumber}`);
            const data = response.data.data;
            setPoData(data);
            setPoDetails(prev => ({
                ...prev,
                ...data,
                po_id: data.po_id,
                po_number: data.po_number,
                po_description: data.po_description,
                po_line_items: data.po_line_items?.map(li => {
                    const id = li.summary_id || li.po_line_item_id;
                    return {
                        ...li,
                        summary_id: id,
                        po_line_item_id: id,
                        quantity_offered: li.quantity_offered || '',
                    };
                }) || []
            }));
            // Initially, all lineitems will be unchecked as requested
            setSelectedLineItemIds([]);

            // CHECK FOR LOCAL PERSISTENCE (AUTO-RESTORE)
            const persisted = loadPOSession(data.po_id);
            if (persisted) {
                setPoDetails(persisted.poDetails);
                setLineItemTrees(persisted.lineItemTrees);
                setSelectedLineItemIds(persisted.selectedLineItemIds);
            } else {
                // Initialize Hierarchy Trees for each line item (Standard fetch logic)
                if (data.po_line_items) {
                    const initialTrees = data.po_line_items.reduce((acc, item) => {
                        const id = item.summary_id || item.po_line_item_id;
                        // Reconstruct tree from incoming data (draft/prefilled from server)
                        acc[id] = reconstructHierarchy(
                            item.sub_items || item.children || [],
                            item.po_item_details || item.item_details || [],
                            item.line_number,
                            null
                        );
                        return acc;
                    }, {});
                    setLineItemTrees(initialTrees);
                }
            }
        } catch (error) {
            console.error('Error fetching PO details:', error);
            addToast({ response: { statusText: 'Failed to fetch PO details' }, type: 'error', status: '500' });
        } finally {
            setFormLoading(false);
        }
    }, [addToast]);

    const handleInspectorChange = (selectedOption) => {
        if (selectedOption) {
            setPoDetails(prev => ({
                ...prev,
                inspector_id: selectedOption.value,
                inspector_user: selectedOption.label
            }));
        }
    };

    const handleViewMore = useCallback((title, data) => {
        setInfoModalTitle(title);
        setInfoModalData(data);
        setInfoModalOpen(true);
    }, []);

    const handleSelectionChange = useCallback((lineItemId) => {
        // Lock selection for non-create tasks
        if (task !== 'Create Inspection') return;

        setSelectedLineItemIds(prev =>
            prev.includes(lineItemId)
                ? prev.filter(id => id !== lineItemId)
                : [...prev, lineItemId]
        );
    }, [task]);

    // Hierarchy Mutation Handlers (LIFTED)
    const addTopLevelItem = useCallback((lineItemId, lineNumber, type) => {
        setLineItemTrees(prev => {
            const currentTree = prev[lineItemId] || [];
            const levelCount = currentTree.filter(i => i.type === 'level').length;
            const newCode = type === 'level' ? `${lineNumber}.${levelCount + 1}` : '';
            const newNode = type === 'level'
                ? {
                    id: Math.random().toString(36).substr(2, 9),
                    line_number: lineNumber,
                    type,
                    code: newCode,
                    description: '',
                    quantity: '',
                    unit: '',
                    subItems: []
                }
                : {
                    id: Math.random().toString(36).substr(2, 9),
                    line_number: lineNumber,
                    type,
                    code: newCode,
                    item_type_id: '',
                    item_make_id: '',
                    item_model_id: '',
                    item_part_id: '',
                    subItems: []
                };
            return { ...prev, [lineItemId]: [...currentTree, newNode] };
        });
    }, []);

    const addSubItem = useCallback((lineItemId, parentId, type) => {
        const addNode = (nodes) => nodes.map(node => {
            if (node.id === parentId) {
                const levelCount = node.subItems.filter(i => i.type === 'level').length;
                const newCode = type === 'level' ? `${node.code}.${levelCount + 1}` : '';
                const newNode = type === 'level'
                    ? {
                        id: Math.random().toString(36).substr(2, 9),
                        line_number: node.line_number,
                        type,
                        code: newCode,
                        description: '',
                        quantity: '',
                        unit: '',
                        subItems: []
                    }
                    : {
                        id: Math.random().toString(36).substr(2, 9),
                        line_number: node.line_number,
                        type,
                        code: newCode,
                        item_type_id: '',
                        item_make_id: '',
                        item_model_id: '',
                        item_part_id: '',
                        subItems: []
                    };
                return { ...node, subItems: [...node.subItems, newNode] };
            }
            return node.subItems.length > 0 ? { ...node, subItems: addNode(node.subItems) } : node;
        });
        setLineItemTrees(prev => ({ ...prev, [lineItemId]: addNode(prev[lineItemId] || []) }));
    }, []);

    const updateNodeField = useCallback((lineItemId, id, field, value) => {
        const updateNode = (nodes) => nodes.map(node => {
            if (node.id === id) return { ...node, [field]: value };
            return node.subItems.length > 0 ? { ...node, subItems: updateNode(node.subItems) } : node;
        });
        setLineItemTrees(prev => ({ ...prev, [lineItemId]: updateNode(prev[lineItemId] || []) }));
    }, []);

    const handleLineItemQtyChange = useCallback((summaryId, newQty) => {
        const lineItem = poDetails.po_line_items.find(li => (li.summary_id === summaryId || li.po_line_item_id === summaryId));
        const remainingQty = lineItem?.remaining_quantity ?? lineItem?.total_quantity ?? 0;
        let qty = parseFloat(newQty) || 0;

        if (qty > remainingQty) {
            qty = remainingQty;
            addToast({
                response: { statusText: `Quantity offered cannot exceed remaining quantity (${remainingQty})` },
                type: 'info',
                status: '100'
            });
        }

        setPoDetails(prev => ({
            ...prev,
            po_line_items: prev.po_line_items.map(li =>
                (li.summary_id === summaryId || li.po_line_item_id === summaryId) ? { ...li, quantity_offered: qty } : li
            )
        }));
    }, [poDetails.po_line_items, addToast]);


    const deleteHierarchyItem = useCallback((lineItemId, id) => {
        const filterNodes = (nodes) => nodes
            .filter(node => node.id !== id)
            .map(node => ({ ...node, subItems: filterNodes(node.subItems) }));
        setLineItemTrees(prev => ({ ...prev, [lineItemId]: filterNodes(prev[lineItemId] || []) }));
    }, []);

    const handleOpenSerials = useCallback((lineItemId, nodeId, serials, remarks, allowDuplicates) => {
        const lineItem = poDetails.po_line_items.find(li => (li.summary_id === lineItemId || li.po_line_item_id === lineItemId));
        const maxQty = lineItem?.quantity_offered || 0;

        setSerialsModal({
            isOpen: true,
            lineItemId: lineItemId,
            nodeId: nodeId,
            serials: serials || [],
            remarks: remarks || '',
            allowDuplicates: allowDuplicates || false,
            maxQty: maxQty
        });
    }, [poDetails.po_line_items]);

    const handleSaveSerials = useCallback(async (newSerials, newRemarks, allowDuplicatesFromModal) => {
        const { lineItemId, nodeId } = serialsModal;

        if (!allowDuplicatesFromModal) {
            // 1. Check for duplicates within the same entry first
            const uniqueNewSerials = [...new Set(newSerials)];
            if (uniqueNewSerials.length !== newSerials.length) {
                addToast({ response: { statusText: 'Duplicate serial numbers found in your entry.' }, type: 'error', status: '400' });
                return false;
            }

            // 2. Check for duplicates across the entire form
            const allOtherSerials = [];
            Object.entries(lineItemTrees).forEach(([ltId, tree]) => {
                const collectSerials = (nodes) => {
                    nodes.forEach(node => {
                        if (node.id !== nodeId) { // Skip current node
                            if (node.item_serial_number) {
                                allOtherSerials.push(...node.item_serial_number);
                            }
                        }
                        if (node.subItems) collectSerials(node.subItems);
                    });
                };
                collectSerials(tree);
            });

            const duplicatesInForm = newSerials.filter(s => allOtherSerials.includes(s));
            if (duplicatesInForm.length > 0) {
                addToast({
                    response: { statusText: `Duplicate serial numbers found in other sections: ${duplicatesInForm.join(', ')}` },
                    type: 'error',
                    status: '400'
                });
                return false;
            }
        }

        // 3. Database uniqueness check (Commented out as requested)
        /*
        if (task === 'Add Item Details' || task === 'Update Inspection') {
            try {
                // However, the user explicitly asked for it. 
                // I'll implement a call to a likely endpoint `/api/items/check_serial`
                const response = await api.post('/api/items/check_serial', { serial_numbers: newSerials });
                if (response.data?.existing_serials?.length > 0) {
                    addToast({
                        response: { statusText: `Serial numbers already exist in database: ${response.data.existing_serials.join(', ')}` },
                        type: 'error',
                        status: '400'
                    });
                    return false;
                }
            } catch (err) {
                console.error('Serial uniqueness check failed:', err);
                // If it's a 404, the endpoint might not exist, we should probably warn or skip
                if (err.response?.status === 404) {
                    console.warn('Endpoint /api/items/check_serial not found. Skipping DB check.');
                } else {
                    addToast(err);
                    return false;
                }
            }
        }
        */

        const updateNode = (nodes) => nodes.map(node => {
            if (node.id === nodeId) return { ...node, item_serial_number: newSerials, remarks: newRemarks, allowDuplicates: allowDuplicatesFromModal };
            return node.subItems && node.subItems.length > 0 ? { ...node, subItems: updateNode(node.subItems) } : node;
        });
        setLineItemTrees(prev => ({ ...prev, [lineItemId]: updateNode(prev[lineItemId] || []) }));
        return true;
    }, [serialsModal, lineItemTrees, addToast, task]);

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            // Recursive helper to transform nodes into the new flat item_details structure
            const transformHierarchy = (nodes, currentSubItemCode = null) => {
                let subItems = [];
                let flatItemDetails = [];

                nodes.forEach(node => {
                    if (node.type === 'level') {
                        const { subItems: children, flatItemDetails: nestedItems } =
                            transformHierarchy(node.subItems || [], node.code);

                        const subItem = {
                            sub_item_number: node.code,
                            sub_item_description: node.description,
                            sub_item_quantity: parseFloat(node.quantity) || 0,
                            sub_item_unit_of_measurement: node.unit,
                            children: children.length > 0 ? children : undefined
                        };

                        subItems.push(subItem);
                        flatItemDetails = [...flatItemDetails, ...nestedItems];
                    } else {
                        // This is an 'item' (leaf node)
                        flatItemDetails.push({
                            item_type_id: node.item_type_id,
                            item_make_id: node.item_make_id,
                            item_model_id: node.item_model_id,
                            item_part_id: node.item_part_id,
                            sub_item_code: currentSubItemCode,
                            quantity_inspected: node.item_serial_number?.length || 0,
                            item_serial_number: node.item_serial_number || [],
                            remarks: node.remarks || ''
                        });
                    }
                });

                return { subItems, flatItemDetails };
            };

            const filteredLineItems = poDetails.po_line_items
                ?.filter(item => selectedLineItemIds.includes(item.summary_id || item.po_line_item_id))
                .map(item => {
                    const treeId = item.summary_id || item.po_line_item_id;
                    const tree = lineItemTrees[treeId] || [];
                    const { subItems, flatItemDetails } = transformHierarchy(tree);

                    return {
                        po_line_item_id: item.po_line_item_id || item.summary_id,
                        line_number: item.line_number,
                        line_item_name: item.line_description || item.line_item_name,
                        description: item.description || item.item_description,
                        unit_price: item.unit_price,
                        unit_measurement: item.unit_measurement || item.unit_of_measure,
                        total_quantity: item.total_quantity,
                        quantity_offered: item.quantity_offered,
                        sub_items: subItems.length > 0 ? subItems : null,
                        po_item_details: flatItemDetails.length > 0 ? flatItemDetails : []
                    };
                }) || [];

            const payload = {
                po_number: poDetails.po_number,
                po_description: poDetails.po_description,
                firm_id: poData?.firm_id,
                tender_number: poData?.tender_number || poData?.tender_no,
                po_date_of_issue: poData?.po_date_of_issue || poData?.po_date,
                purchaser_id: assigneeUserId,
                inspector_id: poDetails.inspector_id,
                pdf_sign_type: poDetails.pdf_sign_type || "Physically_Sign",
                inspection_location: poDetails.inspection_location,
                po_remarks: poDetails.po_remarks,
                po_line_items: filteredLineItems
            };

            // Comprehensive Validations
            if (!poDetails.po_number) {
                addToast({ response: { statusText: 'Please search and select a PO Number first.' }, type: 'error', status: '400' });
                return;
            }

            if (!poDetails.inspector_id) {
                addToast({ response: { statusText: 'Please select an Inspection Authority (Inspector).' }, type: 'error', status: '400' });
                return;
            }

            if (filteredLineItems.length === 0) {
                addToast({ response: { statusText: 'Please select at least one line item and ensure it has item details.' }, type: 'error', status: '400' });
                return;
            }

            // Validate each selected line item's tree (ensure it's not empty)
            for (const item of filteredLineItems) {
                if (item.po_item_details.length === 0) {
                    addToast({ response: { statusText: `Line Item ${item.line_number} must have at least one item detail.` }, type: 'error', status: '400' });
                    return;
                }


                // Check Serial Numbers match Qty Offered for Add/Update tasks
                // if (task !== 'Create Inspection') {
                //     const totalSerials = item.po_item_details.reduce((sum, det) => sum + (det.item_serial_number?.length || 0), 0);
                //     if (totalSerials !== item.quantity_offered) {
                //         addToast({
                //             response: { statusText: `Line ${item.line_number}: Total serial numbers (${totalSerials}) must match Quantity Offered (${item.quantity_offered}).` },
                //             type: 'error',
                //             status: '400'
                //         });
                //         return;
                //     }
                // }
            }

            // Pause and Open Preview Modal instead of Submitting directly
            const uiPayload = {
                ...payload,
                inspector_user: poDetails.inspector_user,
                lineItemTrees: lineItemTrees
            };
            setPreviewPayload(uiPayload);
            setPreviewModalOpen(true);

        } catch (error) {
            console.error('Error preparing PO:', error);
            addToast(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const executeSubmit = async (finalPayload) => {
        setSubmitLoading(true);
        setPreviewModalOpen(false); // Close preview modal

        try {
            // Clean up UI-only field from payload
            const payloadToSubmit = { ...finalPayload };
            delete payloadToSubmit.inspector_user;
            delete payloadToSubmit.lineItemTrees;

            console.log('Final API Payload:', payloadToSubmit);

            const method = task === 'Create Inspection' ? 'post' : 'put';
            const url = task === 'Create Inspection'
                ? '/api/pos'
                : task === 'Add Item Details'
                    ? `/api/pos-dataEntry/${poDetails?.po_id}`
                    : `/api/pos-correction/${poDetails?.po_id}`;

            const expectsPdf = task === 'Add Item Details' || task === 'Update Inspection';
            const config = {
                ...(expectsPdf ? { responseType: 'arraybuffer' } : {}),
            };

            const response = await api[method](url, payloadToSubmit, config);

            // Clear local session on success
            clearPOSession(poDetails?.po_id);

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
                onClose();
            }
        } catch (error) {
            console.error('Error creating PO:', error);
            addToast(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const onDraft = async () => {
        setDraftLoading(true);
        try {
            const response = await handleSaveDraft({
                poDetails,
                poData,
                lineItemTrees,
                assigneeUserId,
                api,
                addToast,
                task
            });

            // Clear local session after server-side draft is saved
            if (response) {
                clearPOSession(poDetails?.po_id);
            }
        } catch (error) {
            // Error is handled inside handleSaveDraft via addToast
        } finally {
            setDraftLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`relative ${isFullScreen ? 'w-screen h-screen' : 'w-full max-w-[95vw] h-[95vh]'} flex flex-col overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 transition-all duration-300`}>
                {/* Header */}
                <div className='flex flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20'>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-slate-400">
                            {task}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsFullScreen((f) => !f)}
                            className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400 transition-all active:scale-95"
                        >
                            <span className="text-xl font-bold px-1">✕</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scrollbar-thin">
                    {/* Compact Search & Selection Row */}
                    {/* PO Selection Card (Search & Summary) */}
                    <div className="max-w-[98vw] mx-auto">
                        <POSelectionCard
                            poNumberValue={poDetails.po_number}
                            inspectorValue={poDetails.inspector_id ? { value: poDetails.inspector_id, label: poDetails.inspector_user } : null}
                            onPoChange={handlePoChange}
                            onInspectorChange={handleInspectorChange}
                            fetchOptions={fetchOptions}
                            poData={poData}
                            isDisabled={task !== 'Create Inspection'}
                            task={task}
                        />
                    </div>

                    {/* Hierarchy Form Section */}
                    {poData && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 max-w-[98vw] mx-auto">
                            {/* <div className="flex items-center justify-between mb-6 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 shadow-sm">
                                        <Hash size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Line Items Distribution</h3>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Hierarchy Structure</p>
                                    </div>
                                </div>
                            </div> */}
                            <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xl">
                                <HierarchyForm
                                    lineItems={poDetails.po_line_items}
                                    lineItemTrees={lineItemTrees}
                                    selectedIds={selectedLineItemIds}
                                    onSelectionChange={handleSelectionChange}
                                    onLineItemQtyChange={handleLineItemQtyChange}
                                    onAddTopLevel={addTopLevelItem}
                                    onAddSubItem={addSubItem}
                                    onUpdateTree={updateNodeField}
                                    onDeleteTree={deleteHierarchyItem}
                                    onOpenSerials={handleOpenSerials}
                                    onViewMore={(line) => handleViewMore(`Line Item Detail: ${line.line_number}`, line)}
                                    task={task}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl border-2 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDraft}
                        disabled={!poData || draftLoading || submitLoading}
                        className={`px-10 py-3 rounded-2xl bg-slate-600 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-500/20 hover:bg-slate-700 hover:shadow-slate-500/40 transition-all active:scale-95 ${(!poData || draftLoading || submitLoading) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1'}`}
                    >
                        {draftLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Import size={16} />
                        )}
                        Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!poData || draftLoading || submitLoading}
                        className={`px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all active:scale-95 ${(!poData || draftLoading || submitLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        {submitLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        Submit
                    </button>
                </div>
            </div>

            {/* Info Modal */}
            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoModalTitle}
                data={infoModalData}
            />

            <SerialNumberModal
                key={`${serialsModal.lineItemId}-${serialsModal.nodeId}`}
                isOpen={serialsModal.isOpen}
                onClose={() => setSerialsModal(prev => ({ ...prev, isOpen: false }))}
                serials={serialsModal.serials}
                remarks={serialsModal.remarks}
                initialAllowDuplicates={serialsModal.allowDuplicates}
                onSave={handleSaveSerials}
                maxQuantity={serialsModal.maxQty}
            />

            <PreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                payload={previewPayload}
                task={task}
                onConfirm={executeSubmit}
            />
        </div>
    );
};

export default HierarchyPOFormModal;