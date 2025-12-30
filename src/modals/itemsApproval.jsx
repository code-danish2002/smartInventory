import { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from 'react-modal';
import GlobalLoading from '../globalLoading';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';
import { downloadPDF } from '../utils/downloadResponsePdf';
import ReadMore from '../utils/readMore';

// Set app element for react-modal
// NOTE: Make sure your root element in index.html is actually <div id="root">
Modal.setAppElement('#root');

/**
 * Renders a modal for approving or rejecting Purchase Order (PO) line items.
 * * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onCancel - Callback function to close the modal.
 * @param {number} props.po_id - The ID of the Purchase Order.
 * @param {function} props.onSubmit - Callback function for a successful operation.
 * @param {string} props.phase - The current inspection phase ('At Store' or 'On Site').
 */

const needAcceptance = (thisStatus) => {
    return thisStatus === "Item Dispatched from Vendor" ||
        thisStatus === "Item Dispatched from Store" ||
        thisStatus === "Item Dispatched from Site" ||
        thisStatus === "Item Dispatched from OEM Spare" ||
        thisStatus === "Item Dispatched from Live";
}

export const ItemsAcceptance = ({ isOpen, onCancel, po_id, onSubmit, phase }) => {
    const [loading, setLoading] = useState(false);
    const [poDetails, setPoDetails] = useState({});
    const [lineItems, setLineItems] = useState([]);
    // State to hold selected item IDs for approval/rejection and remarks
    const [inspectedItems, setInspectedItems] = useState({
        approve: [], // Array of po_item_details_id (number)
        reject: [],  // Array of po_item_details_id (number)
        remarks: '',
    });

    const addToast = useToast();
    const [refreshLineItems, setRefreshLineItems] = useState(false);

    // Determine the phase name used for API calls
    const thisPhase = phase === 'At Store' ? 'Store' : phase === 'On Site' ? 'Site' : 'Approve PO';

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!isOpen || !po_id) return;

        setLoading(true);
        let isMounted = true;

        api.get(`/api/fullPoDataForApproval/${po_id}`, { params: { phase: thisPhase } })
            .then(res => {
                if (!isMounted) return;
                setLineItems(res.data.data.po_line_items || []);
                setPoDetails({
                    po_number: res.data.data.po_number || 'N/A',
                    po_description: res.data.data.po_description || 'N/A'
                });
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Failed to load PO data:", err);
                addToast({
                    response: { statusText: 'Failed to load PO data' },
                    type: 'error',
                    status: '500'
                });
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, refreshLineItems, po_id, thisPhase, addToast]);


    // --- Computed Values: Pending Items & Grouping ---

    const pendingItemsByLineItem = useMemo(() => {
        const pendingMap = new Map();

        lineItems?.forEach(lineItem => {
            const pendingDetails = lineItem.po_item_details
                // Filter for items needing acceptance
                .filter(detail => needAcceptance(detail.po_item_status))
                .map(detail => ({
                    // Mapping to a flattened structure for easier use
                    po_item_details_id: detail.po_item_details_id, // Key for approval/rejection
                    po_line_item_id: lineItem.po_line_item_id,
                    line_item_name: lineItem.line_item_name,
                    item_name: detail.item_type_name,
                    item_serial_number: detail.item_serial_number,
                    item_make_name: detail.item_make_name,
                    item_model_name: detail.item_model_name,
                    item_location: detail.item_location,
                    quantity: detail.quantity_inspected,
                    // *** ADDED: Project Number ***
                    project_number: detail.project_number,
                }));

            if (pendingDetails.length > 0) {
                pendingMap.set(lineItem.po_line_item_id, {
                    line_item_name: lineItem.line_item_name,
                    items: pendingDetails
                });
            }
        });

        return Array.from(pendingMap.values());
    }, [lineItems]);

    const allPendingItems = pendingItemsByLineItem.flatMap(group => group.items);
    const hasAnySelection = inspectedItems.approve.length > 0 || inspectedItems.reject.length > 0;

    // --- Handlers ---

    // Handler for individual item selection
    const toggleItemApproval = useCallback((item, action) => {
        setInspectedItems(prev => {
            const id = item.po_item_details_id;

            const isCurrentlyApproved = prev.approve.includes(id);
            const isCurrentlyRejected = prev.reject.includes(id);

            // Remove existing entry for this specific item from both arrays
            let newApprove = prev.approve.filter(a => a !== id);
            let newReject = prev.reject.filter(r => r !== id);

            if (action === 'approve') {
                if (!isCurrentlyApproved) {
                    newApprove.push(id);
                }
            } else if (action === 'reject') {
                if (!isCurrentlyRejected) {
                    newReject.push(id);
                }
            }

            return {
                ...prev,
                approve: newApprove,
                reject: newReject
            };
        });
    }, []);

    // Handler for line item bulk approval
    const toggleLineItemApproval = useCallback((lineItemId, items, checked) => {
        setInspectedItems(prev => {
            // Remove existing approvals and rejections for this line item
            let newApprove = prev.approve.filter(id => {
                // Check if the item ID belongs to the current lineItemId
                const item = allPendingItems.find(p => p.po_item_details_id === id);
                return item?.po_line_item_id !== lineItemId;
            });
            let newReject = prev.reject.filter(id => {
                const item = allPendingItems.find(p => p.po_item_details_id === id);
                return item?.po_line_item_id !== lineItemId;
            });


            if (checked) {
                const newIdsToApprove = items.map(item => item.po_item_details_id);
                newApprove = [...newApprove, ...newIdsToApprove];
            }

            return {
                ...prev,
                approve: newApprove,
                reject: newReject
            };
        });
    }, [allPendingItems]);

    // Handler for line item bulk rejection
    const toggleLineItemRejection = useCallback((lineItemId, items, checked) => {
        setInspectedItems(prev => {
            // Remove existing approvals and rejections for this line item
            let newApprove = prev.approve.filter(id => {
                const item = allPendingItems.find(p => p.po_item_details_id === id);
                return item?.po_line_item_id !== lineItemId;
            });
            let newReject = prev.reject.filter(id => {
                const item = allPendingItems.find(p => p.po_item_details_id === id);
                return item?.po_line_item_id !== lineItemId;
            });

            if (checked) {
                const newIdsToReject = items.map(item => item.po_item_details_id);
                newReject = [...newReject, ...newIdsToReject];
            }

            return {
                ...prev,
                approve: newApprove,
                reject: newReject
            };
        });
    }, [allPendingItems]);

    // Handler for remarks change
    const handleRemarksChange = (e) => {
        setInspectedItems(prev => ({
            ...prev,
            remarks: e.target.value
        }));
    };

    // Unified handler for Approve/Reject action
    const handleAction = useCallback(async (body) => {
        if (body.approve.length === 0 && body.reject.length === 0) {
            addToast({
                response: { statusText: 'Please select at least one item to approve or reject.' },
                type: 'error',
                status: '400'
            });
            return;
        }
        if (body.reject.length > 0 && (body?.remarks?.trim() === '' || !body?.remarks)) {
            addToast({
                response: { statusText: 'Please provide remarks for rejected items.' },
                type: 'error',
                status: '400'
            });
            return;
        }

        setLoading(true);
        try {
            const thisEndpoint = phase === 'At Store' ? '/api/store-items/action' :
                phase === 'On Site' ? '/api/site-items/action' : '';
            const apiBody = { ...body };
            const response = await api.post(thisEndpoint, apiBody);
            const filename = response?.data?.report_key?.split('/').pop() || 'Inspection_Certificate.pdf';
            if (response.data?.report_url) {
                downloadPDF(response.data.report_url, filename);
                window.open(response.data.report_url, '_blank');
            }

            // Reset state and refresh item list on success
            addToast({
                response: { statusText: response?.data?.message || 'Item(s) Actioned!' },
                type: 'success',
                status: '200'
            });
            setRefreshLineItems(prev => !prev);
            setInspectedItems({
                approve: [],
                reject: [],
                remarks: '',
            });
            if (onSubmit) onSubmit();

        } catch (err) {
            console.error("Action failed:", err);
            addToast(err);
        } finally {
            setLoading(false);
            onCancel();
        }
    }, [addToast, phase, onSubmit]);


    // --- Component Rendering ---

    if (loading) return <GlobalLoading />;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancel}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            contentLabel="Item Inspection"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            {/* The main container uses flex-col and max-h-[90vh] to manage scrolling */}
            <div className="bg-white rounded-lg w-full max-w-7xl relative shadow-2xl flex flex-col max-h-[90vh]">

                {/* Fixed Header */}
                <div className="p-4 flex items-start justify-between rounded-t-lg border-b border-gray-200 bg-white z-20">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {poDetails.po_number} - Item Approval ({thisPhase})
                        </h2>
                        <ReadMore text={poDetails.po_description} />
                        {allPendingItems.length === 0 && (
                            <p className="text-md text-green-600 font-semibold mt-2">
                                ✅ All items for this PO have been processed!
                            </p>
                        )}
                    </div>
                    <button onClick={onCancel} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-lg" aria-label='Close'>
                        &times;
                    </button>
                </div>

                {/* Scrollable Content (Items Table Grouped by Line Item) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {pendingItemsByLineItem.length > 0 ? (
                        pendingItemsByLineItem.map(lineItemGroup => {
                            const lineItemId = lineItemGroup.items[0].po_line_item_id;

                            const approvedCount = lineItemGroup.items.filter(item =>
                                inspectedItems.approve.includes(item.po_item_details_id)
                            ).length;
                            const rejectedCount = lineItemGroup.items.filter(item =>
                                inspectedItems.reject.includes(item.po_item_details_id)
                            ).length;

                            const isLineItemAllApproved = approvedCount === lineItemGroup.items.length && lineItemGroup.items.length > 0;
                            const isLineItemAllRejected = rejectedCount === lineItemGroup.items.length && lineItemGroup.items.length > 0;

                            return (
                                <div key={lineItemId} className="border border-gray-200 rounded-lg shadow-sm">
                                    {/* Line Item Header with Bulk Action Checkboxes - STICKY INSIDE SCROLLABLE AREA */}
                                    <div className="bg-gray-50 p-3 flex flex-wrap justify-between items-center border-b border-gray-200 sticky top-0 z-10 rounded-t-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 break-words w-full sm:w-auto">
                                            {lineItemGroup.line_item_name}
                                            <span className="text-sm font-normal text-gray-500 ml-2">({lineItemGroup.items.length} Pending)</span>
                                        </h3>
                                        <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
                                            {/* Approve All Checkbox */}
                                            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-green-600 font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={isLineItemAllApproved}
                                                    onChange={e => toggleLineItemApproval(lineItemId, lineItemGroup.items, e.target.checked)}
                                                    className="w-4 h-4 accent-green-600 rounded"
                                                    //disabled={lineItemGroup.items.length === 0 || isLineItemAllRejected}
                                                />
                                                Approve All
                                            </label>
                                            {/* Reject All Checkbox */}
                                            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-red-600 font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={isLineItemAllRejected}
                                                    onChange={e => toggleLineItemRejection(lineItemId, lineItemGroup.items, e.target.checked)}
                                                    className="w-4 h-4 accent-red-600 rounded"
                                                    //disabled={lineItemGroup.items.length === 0 || isLineItemAllApproved}
                                                />
                                                Reject All
                                            </label>
                                        </div>
                                    </div>

                                    {/* Items Table for this Line Item */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100 hidden lg:table-header-group">
                                                <tr>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">Item Type / Make / Model</th>
                                                    {/* ADDED HEADER */}
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">Project No.</th>
                                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">Serial Number / Location</th>
                                                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-[7.5%]">Approve</th>
                                                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-red-600 uppercase tracking-wider w-[7.5%]">Reject</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {lineItemGroup.items.map((item, index) => {
                                                    const isApproved = inspectedItems.approve.includes(item.po_item_details_id);
                                                    const isRejected = inspectedItems.reject.includes(item.po_item_details_id);

                                                    return (
                                                        <tr key={item.po_item_details_id} className="hover:bg-yellow-50/50 transition-colors lg:table-row flex flex-col lg:flex-row border-b lg:border-none">
                                                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 lg:table-cell hidden lg:w-[5%]">
                                                                {index + 1}
                                                            </td>

                                                            {/* Item Details (Responsive) */}
                                                            <td className="px-3 py-2 text-sm text-gray-900 lg:w-[20%]">
                                                                <div className="font-semibold text-gray-800 flex items-center">
                                                                    <span className="lg:hidden text-xs text-gray-500 mr-2">{index + 1}.</span>
                                                                    {item.item_name}
                                                                </div>
                                                                <div className="text-xs text-gray-500">Make: {item.item_make_name} / Model: {item.item_model_name}</div>
                                                            </td>

                                                            {/* *** ADDED: Project Number Cell *** */}
                                                            <td className="px-3 py-2 text-sm text-gray-900 lg:w-[15%]">
                                                                <div className="font-semibold text-gray-700">
                                                                    <span className="lg:hidden text-xs font-medium text-gray-500 mr-1">Project:</span>
                                                                    {item.project_number}
                                                                </div>
                                                            </td>

                                                            {/* S/N & Location (Responsive) */}
                                                            <td className="px-3 py-2 text-sm text-gray-500 lg:w-[40%]">
                                                                <div className="font-mono text-xs text-gray-700">S/N: {item.item_serial_number || 'N/A'}</div>
                                                                <div className="text-xs text-gray-500">Loc: {item.item_location}</div>
                                                            </td>

                                                            {/* Action Checkboxes (Responsive) */}
                                                            <td className="px-3 py-2 whitespace-nowrap text-center flex justify-between items-center lg:table-cell lg:w-[7.5%] border-t lg:border-none">
                                                                <span className="lg:hidden text-sm font-medium text-green-600">Approve:</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isApproved}
                                                                    onChange={() => toggleItemApproval(item, 'approve')}
                                                                    className="w-5 h-5 accent-green-600 cursor-pointer"
                                                                    //disabled={isRejected}
                                                                />
                                                            </td>

                                                            <td className="px-3 py-2 whitespace-nowrap text-center flex justify-between items-center lg:table-cell lg:w-[7.5%] border-t lg:border-none">
                                                                <span className="lg:hidden text-sm font-medium text-red-600">Reject:</span>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isRejected}
                                                                    onChange={() => toggleItemApproval(item, 'reject')}
                                                                    className="w-5 h-5 accent-red-600 cursor-pointer"
                                                                    //disabled={isApproved}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // No pending items message
                        <div className="text-center p-12 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Items</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                All items in this PO for the **{thisPhase}** phase have been actioned.
                            </p>
                        </div>
                    )}
                </div>

                {/* Fixed Footer (Remarks and Actions) */}
                {allPendingItems.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-white z-20 flex flex-col md:flex-row gap-4">
                        {/* Remarks Section */}
                        <div className="flex-1">
                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks <span className={`text-red-500 ${inspectedItems.reject.length > 0 ? 'font-bold' : 'hidden'}`}>* Required for Rejection</span>
                            </label>
                            <textarea
                                id="remarks"
                                rows="2"
                                value={inspectedItems.remarks}
                                onChange={handleRemarksChange}
                                placeholder="Enter inspection remarks here (required for rejected items)..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:items-end mt-4 md:mt-0">
                            <button
                                onClick={onCancel}
                                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(inspectedItems)}
                                disabled={loading || !hasAnySelection}
                                className={`w-full sm:w-auto px-6 py-2 rounded-md shadow-lg text-sm font-semibold text-white transition-all duration-200 
                                    ${hasAnySelection ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {loading ? 'Processing...' : `Submit Action (${inspectedItems.approve.length + inspectedItems.reject.length})`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};