import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import GlobalLoading, { ContentLoading } from '../globalLoading';
import { FaShippingFast } from 'react-icons/fa';
import ParentModal from './parentModal';
import api from '../api/apiCall';
import UploadPDF from './pdfUpload';
import ConfirmationModal from './confirmationModal';
import SelectItemsModal from './selectItems';
import { useToast } from '../context/toastProvider';
import ReadMore from '../utils/readMore';

export const LineItemsInspection = ({ isOpen, onCancel, po_id }) => {
    const [loading, setLoading] = useState(true);
    const [poDetails, setPoDetails] = useState({});
    const [lineItems, setLineItems] = useState([]);
    const [inspectedItems, setInspectedItems] = useState({
        approve: [],
        reject: [],
        remarks: '',
        pdf_sign_type: "Physically_Sign",
    });

    const addToast = useToast();
    const [refreshLineItems, setRefreshLineItems] = useState(false);
    const [modalOperation, setModalOperation] = useState({ open: false, type: null, data: null, name: null, parentRow: null, table: null });
    const [openPDFUploadModal, setOpenPDFUploadModal] = useState(false);
    const [openDispatchModal, setOpenDispatchModal] = useState({ isOpen: false, po_line_item_id: null, po_item_details_id: null });
    const [confirmApproval, setConfirmApproval] = useState(null);

    // check if *all* pendings are approved or rejected:
    const pendingIds = lineItems.filter(i => i.line_item_status === 'Pending Approval').map(i => i.po_line_item_id);
    const allApproved = pendingIds.length > 0 && pendingIds.every(id => inspectedItems.approve.some(a => a.po_line_item_id === id));
    const allRejected = pendingIds.length > 0 && pendingIds.every(id => inspectedItems.reject.some(r => r.po_line_item_id === id));


    useEffect(() => {
        api.get(`/api/allPoLineDataByPoId/${po_id}`)
            .then(res => {
                console.log(res.data.data);
                setLineItems(res.data.data);
                setPoDetails(res.data.po_details);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [refreshLineItems]);

    console.log("Line Items:", poDetails, lineItems, lineItems.po_number);

    async function handleAction(body) {
        const thisBody = { ...body, po_id };
        console.log(body);
        setLoading(true);
        await api.post('/api/po-actions', thisBody).then(response => {
            addToast(response);
            setRefreshLineItems(!refreshLineItems);
        }).catch(err => {
            console.log(err);
            addToast(err);
        }).finally(() => {
            onCancel();
        })
        setLoading(false);
    }

    async function handleDispatch(e, line_item_name, po_line_item_id) {
        e.preventDefault();
        setLoading(true);
        await api.get(`/api/pdf-exists/${po_line_item_id}`, { params: { po_line_item_id } })
            .then(res => {
                res.data.exists ? setOpenDispatchModal({ isOpen: true, po_line_item_id: po_line_item_id, line_item_name, po_item_details_id: null }) : setOpenPDFUploadModal(po_line_item_id);
            })
            .catch(err => {
                console.log(err);
            }).finally(() => {
                setLoading(false);
            });
    }

    const hasAnySelection = inspectedItems.approve.length > 0 || inspectedItems.reject.length > 0;

    // 3️⃣ handlers to toggle “all”:
    function toggleApproveAll(checked) {
        setInspectedItems(prev => ({
            ...prev,
            approve: checked ? pendingIds.map(id => ({ po_line_item_id: id })) : [],
            reject: checked ? [] : prev.reject,
        }));
    }
    function toggleRejectAll(checked) {
        setInspectedItems(prev => ({
            ...prev,
            reject: checked ? pendingIds.map(id => ({ po_line_item_id: id })) : [],
            approve: checked ? [] : prev.approve,
        }));
    }

    return (
        <>{loading ? (<ContentLoading />) : (
            <Modal
                isOpen={isOpen}
                onRequestClose={onCancel}
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                contentLabel="Add Item Details"
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
            >
                <div className="bg-white p-4 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                    <div className="p-4 flex items-start justify-between rounded-t-lg border-b border-gray-200 bg-white z-20">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {poDetails.po_number} - Line Item Approval
                            </h2>
                            <ReadMore text={poDetails.po_description} />
                        </div>
                        <button onClick={onCancel} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-lg" aria-label='Close'>
                            &times;
                        </button>
                    </div>

                    {lineItems.length > 0 ? (
                        <div className="mt-4">
                            <div className='hidden sm:grid sm:grid-cols-6 justify-center items-center bg-slate-100 gap-3  p-2 rounded-md text-center font-semibold text-gray-600'>
                                <div className="text-gray-600 font-semibold col-span-2">Line Items</div>
                                <div className="text-gray-600 font-semibold col-span-1">Total Quantity</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Offered</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Inspected</div>
                                <div className="text-gray-600 font-semibold col-span-1">View Items</div>
                            </div>
                            {lineItems.map((item, index) => {
                                const isApproved = inspectedItems.approve.some(a => a.po_line_item_id === item.po_line_item_id);
                                const isRejected = inspectedItems.reject.some(r => r.po_line_item_id === item.po_line_item_id);

                                return (
                                    <div id={item.po_line_item_id} key={item.po_line_item_id} className="mt-2 max-w-full">
                                        <div key={index} className="grid grid-cols-2 sm:grid-cols-6 gap-3 justify-center bg-slate-50 p-2 rounded-md">
                                            <div className="flex justify-center items-center text-gray-700 col-span-2">
                                                <span className="font-medium sm:hidden">Name: </span>
                                                <div className="text-gray-600 font-semibold">{item.line_item_name}</div>
                                            </div>
                                            <div className="flex justify-center items-center text-gray-700 col-span-1">
                                                <span className="font-medium sm:hidden">Total Quantity: </span>
                                                <div className="text-gray-600 font-semibold">{item.total_quantity}</div>
                                            </div>
                                            <div className="flex justify-center items-center text-gray-700 col-span-1">
                                                <span className="font-medium sm:hidden">Qty Offered:</span>
                                                <div className="text-gray-600 font-semibold">{item.quantity_offered}</div>
                                            </div>
                                            <div className="flex justify-center items-center text-gray-700 col-span-1">
                                                <span className="font-medium sm:hidden">Qty Inspected:</span>
                                                <div className="text-gray-600 font-semibold">{item.quantity_inspected}</div>
                                            </div>
                                            <div className="flex justify-center items-center text-gray-700 col-span-1">
                                                <span className="font-medium sm:hidden">Items:</span>
                                                <button className='text-sm font-medium text-blue-600 hover:bg-blue-100 p-2 rounded-lg'
                                                    onClick={() => setModalOperation({ open: true, type: 'view', data: { params: { po_id: po_id, po_line_item_id: item.po_line_item_id } }, table: 'Item Details' })}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex justify-end mt-4">
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                                    onClick={() => handleAction({ action: 'approve' })}
                                >
                                    Approve
                                </button>
                                <button
                                    className="ml-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                                    onClick={() => setConfirmApproval({ isOpen: true, type: 'reject', id: po_id, name: 'Purchase Order' })}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 font-semibold mt-4 mb-6">No line items found.</div>
                    )}
                </div>
            </Modal>
        )}
            {console.log(confirmApproval)}
            {modalOperation?.open && <ParentModal modalName={modalOperation?.table} isOpen={modalOperation?.open} onClose={() => setModalOperation({ open: false, type: null, data: null, table: null })} type={modalOperation?.type} data={modalOperation?.data} />}
            {openPDFUploadModal && <UploadPDF isOpen={openPDFUploadModal ?? false} onCancel={() => setOpenPDFUploadModal(null)} po_id={po_id} po_line_item_id={openPDFUploadModal} />}
            {confirmApproval?.isOpen && <ConfirmationModal isOpen={confirmApproval?.isOpen} actionType={confirmApproval?.type} itemName={confirmApproval?.name} po_id={po_id} onCancel={() => setConfirmApproval(null)} submitModal={handleAction} />}
            {openDispatchModal.isOpen && <SelectItemsModal isOpen={openDispatchModal.isOpen} onClose={() => setOpenDispatchModal({ isOpen: false, po_line_item_id: null, po_item_details_id: null })} onModalSubmit={() => setRefreshLineItems(!refreshLineItems)} po_line_item_id={openDispatchModal.po_line_item_id} line_item_name={openDispatchModal.line_item_name} po_item_details_id={openDispatchModal.po_item_details_id} />}
        </>
    )
}