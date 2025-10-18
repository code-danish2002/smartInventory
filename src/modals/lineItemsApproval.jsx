import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import GlobalLoading from '../globalLoading';
import { FaShippingFast } from 'react-icons/fa';
import ParentModal from './parentModal';
import api from '../api/apiCall';
import UploadPDF from './pdfUpload';
import ConfirmationModal from './confirmationModal';
import SelectItemsModal from './selectItems';
import { useToast } from '../context/toastProvider';
import { set } from 'react-hook-form';
import { Download } from '../utils/icons';
import { downloadPDF } from '../utils/downloadResponsePdf';
import { extractResponseInfo } from '../utils/responseInfo';
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
        console.log(body);
        setLoading(true);
        if (body.approve.length === 0 && body.reject.length === 0) {
            addToast({ response: { statusText: 'Please select at least one item to approve or reject.' }, type: 'error', status: '400' });
            setLoading(false);
            return;
        }
        if (body.reject.length > 0 && (body?.remarks?.trim() === '' || !body?.remarks)) {
            alert("Please provide remarks for rejected items.");
            setLoading(false);
            return;
        }

        const config = {
            ...(body?.approve?.length > 0 ? { responseType: 'arraybuffer' } : {}),
        }
        await api.post(`/api/inspection-auths`, body, config)
            .then(response => {
                if (response.headers['content-type'] === 'application/pdf' && body?.approve?.length > 0) {
                    const { filename, message } = extractResponseInfo(response, 'Line Item Inspection Certificate.pdf');
                    console.log(filename, message, response?.headers, response);
                    downloadPDF(response.data, filename);
                    addToast({ response: { statusText: 'Inspection Certificate Generated!' }, type: 'success', status: '200' });;
                } else {
                    addToast(response);
                }
                setRefreshLineItems(!refreshLineItems);
            })
            .catch(err => {
                console.log(err);
                addToast(err);
            }).finally(() => {
                setInspectedItems({ approve: [], reject: [], remarks: '', pdf_sign_type: "Physically_Sign" });
                setLoading(false);
            });
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
        <>{loading ? (<GlobalLoading />) : (
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

                    {pendingIds.length > 1 &&
                        <div className="flex w-full sm:hidden items-center gap-6 mt-4 mb-2 px-2">
                            <label className="inline-flex w-full justify-center items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={allApproved}
                                    onChange={e => toggleApproveAll(e.target.checked)}
                                    className="w-4 h-4 accent-green-600"
                                    disabled={pendingIds.length === 0}
                                />
                                <span className="text-gray-700 font-medium">Approve All</span>
                            </label>

                            <label className="inline-flex w-full justify-center items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={allRejected}
                                    onChange={e => toggleRejectAll(e.target.checked)}
                                    className="w-4 h-4 accent-red-600"
                                    disabled={pendingIds.length === 0}
                                />
                                <span className="text-gray-700 font-medium">Reject All</span>
                            </label>
                        </div>
                    }

                    {lineItems.length > 0 ? (
                        <div className="mt-4">
                            <div className='hidden sm:grid sm:grid-cols-8 justify-center items-center bg-slate-100 gap-3  p-2 rounded-md text-center font-semibold text-gray-600'>
                                <div className="text-gray-600 font-semibold col-span-2">Line Items</div>
                                <div className="text-gray-600 font-semibold col-span-1">Total Quantity</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Offered</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Inspected</div>
                                <div className="text-gray-600 font-semibold col-span-1">View Items</div>
                                {/* <div className="text-gray-600 font-semibold col-span-1">⬇PDF</div> */}
                                {pendingIds.length > 1 ? (
                                    <div className="col-span-2 flex justify-center gap-1">
                                        {/* Approve All */}
                                        <label className="inline-flex w-full justify-center items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={allApproved}
                                                onChange={e => toggleApproveAll(e.target.checked)}
                                                disabled={pendingIds.length === 0}
                                                className="w-4 h-4 accent-green-600"
                                            />
                                            <span className="text-gray-700">Approve All</span>
                                        </label>

                                        {/* Reject All */}
                                        <label className="inline-flex w-full justify-center items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={allRejected}
                                                onChange={e => toggleRejectAll(e.target.checked)}
                                                disabled={pendingIds.length === 0}
                                                className="w-4 h-4 accent-red-600"
                                            />
                                            <span className="text-gray-700">Reject All</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 font-semibold col-span-2">Action</div>
                                )}
                            </div>
                            {lineItems.map((item, index) => {
                                const isApproved = inspectedItems.approve.some(a => a.po_line_item_id === item.po_line_item_id);
                                const isRejected = inspectedItems.reject.some(r => r.po_line_item_id === item.po_line_item_id);

                                return (
                                    <div id={item.po_line_item_id} key={item.po_line_item_id} className="mt-2 max-w-full">
                                        <div key={index} className="grid grid-cols-2 sm:grid-cols-8 gap-3 justify-center bg-slate-50 p-2 rounded-md">
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
                                            {/* <div className="flex justify-center items-center text-gray-700 col-span-1">
                                                <span className="font-medium sm:hidden">⬇PDF:</span>
                                                <button className='text-sm font-medium text-blue-600 hover:bg-blue-100 p-2 rounded-lg disabled:cursor-not-allowed' disabled={item.line_item_status !== 'Ready for Dispatch'}
                                                    onClick={async () => {
                                                        const config = { responseType: 'arraybuffer' };
                                                        api.get(`/api/inspection-auth/pdf/${item.po_line_item_id}`, config).then((response) => {
                                                            if (response.headers['content-type'] === 'application/pdf') {
                                                                downloadPDF(response.data, `${item.line_item_name}-inspection.pdf`);
                                                                addToast({ response: { statusText: 'PDF downloaded!' }, type: 'success', status: '200' });
                                                            } else {
                                                                addToast(response);
                                                            }
                                                        })
                                                            .catch((error) => {
                                                                console.error('Error downloading PDF:', error);
                                                                addToast(error);
                                                            });
                                                    }}
                                                >
                                                    <Download className='w-5 h-5' />
                                                </button>
                                            </div> */}
                                            {item.line_item_status === 'Pending Approval' ? (
                                                <div className="flex items-center col-span-2 gap-3">
                                                    <div
                                                        role="button"
                                                        aria-pressed={isApproved}
                                                        onClick={() => {
                                                            setInspectedItems(prev => ({
                                                                approve: isApproved
                                                                    ? prev.approve.filter(a => a.po_line_item_id !== item.po_line_item_id)
                                                                    : [...prev.approve, { po_line_item_id: item.po_line_item_id }],
                                                                reject: prev.reject.filter(r => r.po_line_item_id !== item.po_line_item_id),
                                                                remarks: prev.remarks,
                                                                pdf_sign_type: prev.pdf_sign_type,
                                                            }));
                                                        }}
                                                        className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg shadow-sm transition duration-200 w-full max-w-xs cursor-pointer ${isApproved
                                                            ? 'border-green-300 shadow-md'
                                                            : 'border-gray-200 hover:border-green-300 hover:shadow-md'} `}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            readOnly
                                                            checked={isApproved}
                                                            className="w-4 h-4 accent-green-600"
                                                        />
                                                        <span className="text-gray-700">Approve</span>
                                                    </div>

                                                    {/* REJECT CARD */}
                                                    <div
                                                        role="button"
                                                        aria-pressed={isRejected}
                                                        onClick={() => {
                                                            setInspectedItems(prev => ({
                                                                reject: isRejected
                                                                    ? prev.reject.filter(r => r.po_line_item_id !== item.po_line_item_id)
                                                                    : [...prev.reject, { po_line_item_id: item.po_line_item_id }],
                                                                approve: prev.approve.filter(a => a.po_line_item_id !== item.po_line_item_id),
                                                                remarks: prev.remarks,
                                                                pdf_sign_type: prev.pdf_sign_type,
                                                            }));
                                                        }}
                                                        className={` flex items-center justify-center gap-2 p-3 border-2 rounded-lg shadow-sm transition duration-200 w-full max-w-xs cursor-pointer ${isRejected
                                                            ? 'border-red-300  shadow-md'
                                                            : 'border-gray-200 hover:border-red-300 hover:shadow-md'} `}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            readOnly
                                                            checked={isRejected}
                                                            className="w-4 h-4 accent-red-600"
                                                        />
                                                        <span className="text-gray-700">Reject</span>
                                                    </div>
                                                </div>)
                                                // : item.line_item_status === 'Ready for Dispatch' ? (
                                                //     <div className="flex items-center col-span-2">
                                                //         <button
                                                //             className='flex flex-row items-center justify-center gap-2 p-3 bg-blue-200 hover:bg-blue-100 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'
                                                //             onClick={(event) => handleDispatch(event, item.line_item_name, item.po_line_item_id)}
                                                //         >
                                                //             Dispatch <FaShippingFast className='ml-2' />
                                                //         </button>
                                                //     </div>
                                                // )
                                                : (<div className="col-span-2 text-center italic text-gray-500">
                                                    {item.line_item_status}
                                                </div>)}
                                        </div>
                                    </div>
                                );
                            })}
                            {(inspectedItems.reject.length > 0 || inspectedItems.approve.length > 0) && <div className="mt-4 p-4 bg-gray-50 rounded-md shadow-md">
                                {inspectedItems.reject.length > 0 && <textarea
                                    className="w-full mt-4 p-2 border border-gray-300 rounded-md"
                                    placeholder="Add Remarks for rejected item/s before submitting inspection"
                                    value={inspectedItems.remarks}
                                    onChange={(e) => setInspectedItems({ ...inspectedItems, remarks: e.target.value })}
                                />}
                                {inspectedItems.approve.length > 0 && <div className='flex items-center justify-start gap-2'>
                                    <input
                                        type="checkbox"
                                        id="digitally_signed"
                                        className="w-4 h-4 ml-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={inspectedItems.pdf_sign_type === "Digitally_Esign"}
                                        onChange={(e) => setInspectedItems({ ...inspectedItems, pdf_sign_type: e.target.checked ? "Digitally_Esign" : "Physically_Sign" })}
                                    />
                                    <label htmlFor='digitally_signed' className="text-gray-600">Digitally Sign the certificate of approved line items</label>
                                </div>}
                            </div>}
                            {hasAnySelection && <div className="flex justify-end mt-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                                    onClick={() => {
                                        handleAction(inspectedItems);
                                    }}
                                >
                                    Submit Inspection
                                </button>
                            </div>}
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 font-semibold mt-4 mb-6">No line items found.</div>
                    )}
                </div>
            </Modal>
        )}
            {modalOperation?.open && <ParentModal modalName={modalOperation?.table} isOpen={modalOperation?.open} onClose={() => setModalOperation({ open: false, type: null, data: null, table: null })} type={modalOperation?.type} data={modalOperation?.data} />}
            {openPDFUploadModal && <UploadPDF isOpen={openPDFUploadModal ?? false} onCancel={() => setOpenPDFUploadModal(null)} po_id={po_id} po_line_item_id={openPDFUploadModal} />}
            {confirmApproval?.isOpen && <ConfirmationModal isOpen={confirmApproval?.isOpen} actionType={confirmApproval?.type} itemName={lineItems?.find(
                (li) => li?.po_line_item_id === confirmApproval?.id
            )?.line_item_name} po_id={po_id} onCancel={() => setConfirmApproval(null)} submitModal={handleAction} loading={loading} />}
            {openDispatchModal.isOpen && <SelectItemsModal isOpen={openDispatchModal.isOpen} onClose={() => setOpenDispatchModal({ isOpen: false, po_line_item_id: null, po_item_details_id: null })} onModalSubmit={() => setRefreshLineItems(!refreshLineItems)} po_line_item_id={openDispatchModal.po_line_item_id} line_item_name={openDispatchModal.line_item_name} po_item_details_id={openDispatchModal.po_item_details_id} />}
        </>
    )
}