import { useState, useEffect, useCallback } from 'react';
import { Package, X, } from 'lucide-react';
import { useToast } from '../../context/toastProvider';
import api from '../../api/apiCall';
import LineItemCard from './lineItemCard';
import ReadMore from '../../utils/readMore';
import ReactModal from 'react-modal';
import { OnSubmitLoading } from '../../utils/icons';


// --- DispatchModal Component (The main container) ---
const DispatchModal = ({ po_id = 4, onClose, phaseName, onSubmit }) => {
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [poData, setPoData] = useState(null);
    const addToast = useToast();
    
    // State to manage dispatch forms at line item level
    const [editingDispatchId, setEditingDispatchId] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(null); // Store line item ID
    const isAnyDispatchFormOpen = !!isAddingNew || editingDispatchId !== null;

    useEffect(() => {
        if (po_id) {
            const thisPhase = phaseName === 'At Store' ? 'Store' : phaseName === 'On Site' ? 'Site' : phaseName === 'OEM Spare' ? 'Spare' : phaseName === 'Live' ? 'Live' : 'Inspection';
            Promise.all([
                api.get(`/api/fullPoDataForDispatch/${po_id}`, { params: { phase: thisPhase } }),
            ])
                .then(([itemsResponse]) => {
                    const rawData = itemsResponse.data.data;
                    const normalize = (data) => {
                        if (!data) return data;
                        return {
                            ...data,
                            po_line_items: (data.po_line_items || []).map(li => ({
                                ...li,
                                // Add dispatches to line item level
                                dispatches: li.dispatches || [],
                                po_item_details: (li.po_item_details || []).map(pd => ({
                                    ...pd,
                                    // ensure quantity_inspected is a number
                                    quantity_inspected: typeof pd.quantity_inspected === 'number' ? pd.quantity_inspected : (parseInt(pd.quantity_inspected) || 0),
                                }))
                            }))
                        };
                    };

                    setPoData(normalize(rawData));
                })
                .catch(err => {
                    console.error(err);
                    addToast(err);
                }).finally(() => {
                    setLoading(false);
                })
        } else {
            setLoading(false);
            return;
        }
    }, []);

    const handleUpdateLineItemDispatches = useCallback((lineItemId, updates) => {
        setPoData(prevPoData => {
            if (!prevPoData) return null;
            const newPoData = { ...prevPoData };
            newPoData.po_line_items = prevPoData.po_line_items.map(lineItem => {
                if (lineItem.po_line_item_id === lineItemId) {
                    return {
                        ...lineItem,
                        ...updates
                    };
                }
                return lineItem;
            });
            return newPoData;
        });
    }, [setPoData]);

    const handleSaveDispatch = useCallback((newDispatch, lineItem) => {
        console.log('newDispatch', newDispatch, 'lineItem', lineItem);
        const dispatches = lineItem.dispatches;
        let updatedDispatches;

        if (dispatches.some(d => d.id === newDispatch.id)) {
            // Edit existing dispatch
            updatedDispatches = dispatches.map(d =>
                d.id === newDispatch.id ? newDispatch : d
            );
            setEditingDispatchId(null);
        } else {
            // Add new dispatch
            updatedDispatches = [...dispatches, newDispatch];
            setIsAddingNew(null);
        }

        handleUpdateLineItemDispatches(lineItem.po_line_item_id, { dispatches: updatedDispatches });
    }, [handleUpdateLineItemDispatches]);

    const handleDeleteDispatch = useCallback((dispatchId, lineItem) => {
        if (window.confirm("Are you sure you want to delete this dispatch request?")) {
            const updatedDispatches = lineItem.dispatches.filter(d => d.id !== dispatchId);
            handleUpdateLineItemDispatches(lineItem.po_line_item_id, { dispatches: updatedDispatches });
        }
    }, [handleUpdateLineItemDispatches]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const createApiBody = () => {
        const stores = [];
        const sites = [];
        const spares = [];
        const lives = [];

        // Process each line item and its dispatches
        poData.po_line_items.forEach(lineItem => {

            // Create a map for quick lookup of po_item_details by their ID
            const itemDetailsMap = lineItem.po_item_details.reduce((map, item) => {
                map[item.po_item_details_id] = item;
                return map;
            }, {});

            lineItem.dispatches.forEach(dispatch => {
                // FIX: Use the assignedSerials (po_item_details_ids) stored in the dispatch object.
                const itemsToDispatchIds = dispatch.assignedSerials ? dispatch.assignedSerials.map(s => s.value) : [];

                // Look up the full item detail objects using the IDs.
                const itemsToDispatch = itemsToDispatchIds
                    .map(id => itemDetailsMap[id])
                    .filter(item => item); // Filter out any undefined/null results

                // Original logic for location/owner lookup (Keep this)
                const locationId = dispatch.location?.value ?? dispatch.store_id ?? dispatch.site_id ?? null;
                const ownerId = dispatch.owner?.value ?? dispatch.store_incharge_user_id ?? dispatch.site_incharge_user_id ?? null;

                itemsToDispatch.forEach(item => {
                    switch (dispatch.phase) {
                        case 'Store':
                            stores.push({
                                store_id: locationId,
                                store_incharge_user_id: ownerId,
                                po_line_item_id: lineItem.po_line_item_id,
                                po_item_details_id: item.po_item_details_id
                            });
                            break;
                        case 'Site':
                            sites.push({
                                site_id: locationId,
                                site_incharge_user_id: ownerId,
                                po_line_item_id: lineItem.po_line_item_id,
                                po_item_details_id: item.po_item_details_id
                            });
                            break;
                        case 'Spare':
                            spares.push({
                                po_line_item_id: lineItem.po_line_item_id,
                                po_item_details_id: item.po_item_details_id,
                                remarks: dispatch.location || null
                            });
                            break;
                        case 'Live':
                            lives.push({
                                po_line_item_id: lineItem.po_line_item_id,
                                po_item_details_id: item.po_item_details_id,
                                remarks: dispatch.location || null
                            });
                            break;
                        default:
                            break;
                    }
                });
            });
        });
        let dispatchFrom = 'inspection';
        if (phaseName === 'At Store') dispatchFrom = 'store';
        else if (phaseName === 'On Site') dispatchFrom = 'site';

        return {
            po_id: poData.po_id,
            stores,
            sites,
            spares,
            lives,
            dispatch_from: dispatchFrom
        };
    };

    return (
        <ReactModal
            isOpen={true}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 z-50 transition-opacity duration-300"
            overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40"
            contentLabel="Item Inspection"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] mx-auto flex flex-col transform transition-all duration-300">
                {/* Modal Header */}
                <div className="flex-shrink-0 bg-white px-6 py-3 border-b border-gray-200 z-10 rounded-t-2xl shadow-sm">
                    <div className='flex justify-between items-start'>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Dispatch Items {poData ? `for PO #${poData.po_number}` : ''}
                        </h1>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-gray-600 transition"
                            title="Close"
                            aria-label="Close"
                            disabled={isSubmitting}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {/* <p className="text-md text-gray-600 mt-1 truncate">{poData?.po_description}</p> */}
                    <ReadMore text={poData?.po_description} />
                </div>

                {/* Line Items List - Fixed scroll issue */}
                <div className="p-6 flex-grow overflow-auto">
                    {poData?.po_line_items?.length > 0 ? (<div className='space-y-4'>
                        {poData?.po_line_items.map(lineItem => {
                            const totalDispatched = lineItem.dispatches.reduce((sum, d) => sum + d.quantity, 0);
                            const availableQuantity = lineItem.po_item_details.length - totalDispatched;

                            return (
                                <LineItemCard
                                    key={lineItem.po_line_item_id}
                                    lineItem={lineItem}
                                    onUpdateItemDetails={() => { }} // Not used anymore
                                    availableQuantity={availableQuantity}
                                    dispatches={lineItem.dispatches}
                                    editingDispatchId={editingDispatchId}
                                    setEditingDispatchId={setEditingDispatchId}
                                    isAddingNew={isAddingNew === lineItem.po_line_item_id}
                                    setIsAddingNew={(val) => setIsAddingNew(val ? lineItem.po_line_item_id : null)}
                                    handleSaveDispatch={(dispatch) => handleSaveDispatch(dispatch, lineItem)}
                                    handleDeleteDispatch={(dispatchId) => handleDeleteDispatch(dispatchId, lineItem)}
                                    phaseName={phaseName}
                                />
                            );
                        })}
                    </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <Package className="w-10 h-10 mx-auto mb-3" />
                            <p className="text-xl font-semibold">No Line Items Found</p>
                            <p>This Purchase Order items need approval before dispatch.</p>
                        </div>
                    )}
                </div>

                {/* Save Button (API call) */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 flex justify-end rounded-b-2xl">
                    <button
                        onClick={() => {
                            if (isSubmitting) return;

                            if (isAnyDispatchFormOpen) {
                                alert("Please save or cancel the currently open dispatch entry form before submitting dispatch.");
                                return;
                            }

                            setIsSubmitting(true);
                            const apiBody = createApiBody();
                            console.log("Final API Body:", apiBody, 'poData:', poData);
                            // check if there is at least one dispatch
                            if (
                                apiBody.stores.length === 0 &&
                                apiBody.sites.length === 0 &&
                                apiBody.spares.length === 0 &&
                                apiBody.lives.length === 0
                            ) {
                                alert("Please add at least one dispatch before submitting.");
                                setIsSubmitting(false);
                                return;
                            }

                            // Call the API
                            api.post('/api/operation-store-dispatch', apiBody)
                                .then(response => {
                                    console.log("Dispatch successful:", response.data);
                                    if (onSubmit) onSubmit();
                                    onClose();
                                })
                                .catch(error => {
                                    console.error("Error saving dispatch:", error);
                                })
                                .finally(() => setIsSubmitting(false));
                        }}
                        className={`w- inline-flex items-center justify-center px-6 py-2 text-lg font-bold text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.01] ${(loading || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading || isSubmitting}
                    >
                        {isSubmitting ? (<OnSubmitLoading />) : 'Submit Dispatch'}
                    </button>
                </div>
            </div>
        </ReactModal>
    );
};

export default DispatchModal;