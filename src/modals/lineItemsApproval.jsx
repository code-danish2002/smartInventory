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
import { generateDevSigningParams } from '../utils/signingParams';
import { GenerateInspectionPDF } from '../utils/inspectionPdfgenerator';

export const LineItemsInspection = ({ isOpen, onCancel, po_id }) => {
    const [loading, setLoading] = useState(true);
    const [poDetails, setPoDetails] = useState({});
    const [lineItems, setLineItems] = useState([]);

    const addToast = useToast();
    const [refreshLineItems, setRefreshLineItems] = useState(false);
    const [modalOperation, setModalOperation] = useState({});
    const [openPDFUploadModal, setOpenPDFUploadModal] = useState(false);
    const [openDispatchModal, setOpenDispatchModal] = useState({ isOpen: false, po_line_item_id: null, po_item_details_id: null });
    const [confirmApproval, setConfirmApproval] = useState(null);


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

    console.log("Line Items:", poDetails, lineItems);

    async function handleAction(actionBody) {
        setLoading(true);
        setConfirmApproval(prev => ({ ...prev, isOpen: false }));
        let thisLineItem = lineItems.filter(item => item.po_line_item_id === confirmApproval.id);
        await api.get(`/api/allPoItemDataByLineItemId/${confirmApproval.id}`)
            .then(res => {
                console.log("Fetched Item Details:", res.data);
                thisLineItem[0].po_item_details = res.data.data;
            }
            )
            .catch(err => {
                console.log("Error fetching item details:", err);
            });
        if (thisLineItem.length === 0) return;

        const pdfBody = {
            po_number: poDetails.po_number,
            tender_number: poDetails.tender_number,
            po_date_of_issue: poDetails.po_date_of_issue,
            po_created_by: poDetails.po_created_by,
            inspected_by: poDetails.inspected_by,
            po_created_at: poDetails.po_created_at,
            pdf_sign_type: actionBody.pdf_sign_type,
            gstin_number: poDetails.gstin_number,
            firm_name: poDetails.firm_name,
            firm_address: poDetails.firm_address,
            contact_person_name: poDetails.contact_person_name,
            contact_number: poDetails.contact_number,
            email_address: poDetails.email_address,
            po_line_items: thisLineItem?.map(item => ({
                line_item_name: item.line_item_name,
                total_quantity: item.total_quantity,
                quantity_offered: item.quantity_offered,
                quantity_inspected: item.quantity_inspected,
                po_item_details: item.po_item_details.map(detail => ({
                    item_type: detail.item_type_name,
                    item_make: detail.item_make_name,
                    item_model: detail.item_model_name,
                    item_part: detail.item_part_code,
                    item_serial_number: detail.item_serial_number, // Assuming this is an array of strings
                }))
            }))
        }
        const signing_params = await generateDevSigningParams();
        console.log("Generated Signing Parameters:", signing_params);
        await api.post(`/api/inspection-auth/${confirmApproval.id}`, actionBody)
            .then(res => {
                addToast(res);
                if (actionBody.action === 'approve') {
                    GenerateInspectionPDF(pdfBody, signing_params)
                }
                setRefreshLineItems(!refreshLineItems);
            })
            .catch(err => {
                console.log(err);
                addToast(err);
            }).finally(() => {
                setConfirmApproval(null);
                setLoading(false);
            });
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
                    <div className="text-xl mb-2 p-2 flex items-center justify-between rounded-md">
                        <h2 className="text-2xl font-semibold text-gray-700">PO: {po_id} - Line Items</h2>
                        <button onClick={onCancel} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-lg">
                            &times;
                        </button>
                    </div>

                    {lineItems.length > 0 ? (
                        <div className="mt-4">
                            <div className='hidden sm:grid sm:grid-cols-8 justify-center items-center bg-slate-100 gap-3  p-2 rounded-md text-center font-semibold text-gray-600'>
                                <div className="text-gray-600 font-semibold col-span-2">Line Items</div>
                                <div className="text-gray-600 font-semibold col-span-1">Total Quantity</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Offered</div>
                                <div className="text-gray-600 font-semibold col-span-1">Quantity Inspected</div>
                                <div className="text-gray-600 font-semibold col-span-1">View Items</div>
                                <div className="text-gray-600 font-semibold col-span-2">Action</div>
                            </div>
                            {lineItems.map((item, index) => (
                                <div id={item.po_line_item_id} key={item.po_line_item_id} className="mt-2">
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
                                            <button className='text-sm font-medium text-blue-600 hover:bg-blue-100 p-2 rounded-lg'
                                                onClick={() => setModalOperation({ name: "Item Details", data: { params: { po_id: po_id, po_line_item_id: item.po_line_item_id }, table: 'Item Details' }, type: 'view' })}
                                            >
                                                View
                                            </button>
                                        </div>
                                        {item.line_item_status === 'Pending Approval' ? (<div className="flex items-center col-span-2 gap-3">
                                            <button onClick={() => setConfirmApproval({ isOpen: true, id: item.po_line_item_id, type: 'approve' })} className='flex flex-row items-center justify-center gap-2 p-3 bg-green-200 hover:bg-green-100 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
                                                Approve
                                            </button>

                                            <button onClick={() => setConfirmApproval({ isOpen: true, id: item.po_line_item_id, type: 'reject' })} className='flex flex-row items-center justify-center gap-2 p-3 bg-red-200 hover:bg-red-100 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'>
                                                Reject
                                            </button>
                                        </div>)
                                            : item.line_item_status === 'Ready for Dispatch' ? (
                                                <div className="flex items-center col-span-2">
                                                    <button
                                                        className='flex flex-row items-center justify-center gap-2 p-3 bg-blue-200 hover:bg-blue-100 rounded-lg shadow-md hover:shadow-lg transition duration-200 w-full max-w-xs'
                                                        onClick={(event) => handleDispatch(event, item.line_item_name, item.po_line_item_id)}
                                                    >
                                                        Dispatch <FaShippingFast className='ml-2' />
                                                    </button>
                                                </div>
                                            )
                                                : (<div className="col-span-2 text-center italic text-gray-500">
                                                    {item.line_item_status}
                                                </div>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 font-semibold mt-4 mb-6">No line items found.</div>
                    )}
                </div>
            </Modal>
        )}
            {Boolean(modalOperation) && <ParentModal modalName={modalOperation?.name} isOpen={Boolean(modalOperation)} onClose={() => setModalOperation({})} type={modalOperation?.type} data={modalOperation?.data} />}
            {openPDFUploadModal && <UploadPDF isOpen={openPDFUploadModal ?? false} onCancel={() => setOpenPDFUploadModal(null)} po_id={po_id} po_line_item_id={openPDFUploadModal} />}
            {confirmApproval?.isOpen && <ConfirmationModal isOpen={confirmApproval?.isOpen} actionType={confirmApproval?.type} itemName={lineItems?.find(
                (li) => li?.po_line_item_id === confirmApproval?.id
            )?.line_item_name} po_id={po_id} onCancel={() => setConfirmApproval(null)} submitModal={handleAction} loading={loading} />}
            {openDispatchModal.isOpen && <SelectItemsModal isOpen={openDispatchModal.isOpen} onClose={() => setOpenDispatchModal({ isOpen: false, po_line_item_id: null, po_item_details_id: null })} onModalSubmit={() => setRefreshLineItems(!refreshLineItems)} po_line_item_id={openDispatchModal.po_line_item_id} line_item_name={openDispatchModal.line_item_name} po_item_details_id={openDispatchModal.po_item_details_id} />}
        </>
    )
}