import { useState, memo, useEffect } from "react";
import Modal from "react-modal";
import { Maximize2, Minimize2 } from "lucide-react";
//import ItemDetailsForm from "../components/create-po/itemForm.jsx";
import MyGrid from "../components/NewDataTable.jsx";
import PDFUpload from "./pdfUpload.jsx";
import { ShowStatus } from "../show_Status.jsx";
import CreatePO from "../components/create-po/createPO.jsx";
import SelectItems from "./selectItems.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/toastProvider.jsx";
import { OnSubmitLoading, Warning } from "../utils/icons.jsx";
import AddSubItem from "./add-new-subItem.jsx";
import getEndpoint from "../utils/endpoints.jsx";
import api from "../api/apiCall.js";
import ItemHistory from "../itemHistory.jsx";

const MainModal = ({ modalName, isOpen, onClose, type, data, onAction }) => {
    const [operation, setOperation] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const addToast = useToast();
    console.log('modal data', modalName, type, data);


    const handleSubmit = async (body) => {
        setSubmitLoading(true);
        let requestFor = modalName;
        if ((type === 'view' || type === 'view-status') && isOpen) {
            requestFor = data?.table;
        }

        let params = data?.params || null
        const method = operation ?? type;

        console.log('method', method, params);

        //handleModalApiCalls
        const thisMethod =
            method === 'create' ? 'post' :
                method === 'update' ? 'put' :
                    method === 'upload_pdf' ? 'post' :
                        method === 'request-approval' ? 'post' :
                            method === 'store' ? 'post' :
                                method === 'dispatch' ? 'post' :
                                    method === 'delete' ? 'delete' :
                                        method;
        // Prepare endpoint and parameters
        let thisParams = params;
        if (method === 'delete') {
            // Rebuild params object based on endpoint definitions
            const paramKeys = getEndpoint(requestFor, method, 'params', params) || [];
            thisParams = paramKeys.reduce((acc, key) => {
                if (params && params[key] !== undefined) {
                    acc[key] = params[key];
                }
                return acc;
            }, {});
        }

        const thisEndpoint = getEndpoint(requestFor, method, 'url', thisParams);
        console.log('API Call:', method.toUpperCase(), thisEndpoint, 'params:', thisParams, 'body:', body);

        // Perform API call
        if (method === 'delete') {
            // axios.delete signature: delete(url, config)
            await api.delete(thisEndpoint, { params: thisParams })
                .then((resp) => { addToast(resp); onAction(); })
                .catch((err) => { console.error(err); addToast(err); })
                .finally(() => { setSubmitLoading(false); onClose(); });
        } else {
            // axios.<method>(url, data, config)
            await api[thisMethod](thisEndpoint, body, { params: thisParams })
                .then((resp) => { addToast(resp); onAction(); })
                .catch((err) => { console.error(err); addToast(err); })
                .finally(() => { setSubmitLoading(false); onClose(); });
        }
    };

    useEffect(() => {
        const requestFor = data?.table;
        //const params = data?.params || null
        if ((type === 'view' || type === 'view-status') && isOpen) {
            const myParams = getEndpoint(requestFor, 'get', 'params', {});
            const thisParams = myParams?.reduce((acc, key) => {
                acc[key] = data?.params?.[key];
                return acc;
            }, {});
            console.log('myParams', myParams, thisParams);
            const endpoint = getEndpoint(requestFor, 'get', 'url', thisParams);
            setModalLoading(true);
            api.get(endpoint, { thisParams }).then((resp) => {
                let apiData = resp?.data?.data || [];
                setModalData(apiData);
                setTotal(resp.data?.pagination?.total);
                setCurrentPage(resp.data?.pagination?.page - 1);
            })
                .catch((err) => {
                    console.error("Failed to fetch sub-items", err);
                    addToast(err);
                    setModalData([]);
                    onClose();
                })
                .finally(() => setModalLoading(false));
        }
    }, [type, isOpen, data, pageSize, currentPage]);

    if (!type || !isOpen) return null

    if( (type === 'view' || type === 'view-status') && !modalData) {
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto"
                overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
            >
                <div className="bg-white shadow-2xl overflow-hidden flex flex-col w-max max-w-6xl rounded-2xl">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">{ modalName || data?.table || '' }</h2>
                        <button onClick={onClose} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">
                            &times;
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-8">
                        <Warning className="w-12 h-12 text-red-500 bg-red-50 rounded-full p-1 " />
                        <div className="px-4">
                            <h2 className="text-lg font-semibold">Record not found</h2>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }

    // Dynamic container classes
    const containerClass = isFullScreen
        ? 'absolute inset-0 m-0 w-full h-full rounded-none'
        : 'w-max max-w-6xl rounded-2xl';

    return (
        <>

            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto"
                overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
            >
                <div className={`bg-white shadow-2xl overflow-hidden flex flex-col ${containerClass}`}>
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {type === 'request-approval' && `Approval Required`}
                            {(type === 'store' || type === 'dispatch') && `${operation || type} Details`}
                            {type === 'view' && 'Details'}
                            {type === 'view-status' && 'Item History'}
                            {type === 'upload_pdf' && 'Upload PDF'}
                            {/* {type === 'update' && `Edit ${modalName || data?.table || ''}`} */}
                            {type === 'add-new' && `Add New ${modalName || data?.table || ''}`}
                            {['Type', 'Make', 'Model', 'Part', 'Firm', 'Stores'].includes(modalName) && (type === 'create' ? `Add ${modalName || data?.table || ''}` : type === 'update' ? `Edit ${modalName || data?.table || ''}` : `Delete ${modalName || data?.table || ''}`)}
                            {/* {`${type} ${modalName || data?.table || ''}`} */}
                        </h2>
                        <div className="flex items-center gap-3">
                            {(type === 'view' || operation || type === 'create' || type === 'upload_pdf') &&
                                <button
                                    onClick={() => setIsFullScreen((f) => !f)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded"
                                    aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
                                >
                                    {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                </button>}
                            <button onClick={() => { onClose(); setOperation(null) }} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">
                                &times;
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="overflow-auto p-4 flex-1">
                        {type === 'request-approval' && (
                            <div className="flex flex-col gap-6 p-4">
                                <p className="text-lg text-gray-700">Please accept or reject the request.</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            handleSubmit({ action: "approve", remarks: "" });
                                        }}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-w-[140px]"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!remarks.trim()) {
                                                alert("Please provide remarks for rejection.");
                                                return;
                                            }
                                            handleSubmit({ action: "reject", remarks });
                                        }}
                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 min-w-[140px]"
                                    >
                                        Reject
                                    </button>
                                </div>

                                {/* Show remarks input only if Reject button is visible */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-lg text-gray-700">Remarks:</p>
                                    <textarea
                                        placeholder="Enter remarks in case of rejection only..."
                                        className="border border-gray-300 p-2 rounded-md"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        {/* {type === 'request-operation' && !operation && (
                            <SelectItems onClose={onClose} onAction={onAction} po_id={data?.params?.po_id} po_item_details_id={data?.params?.po_item_details_id} />
                        )} */}
                        {/* {operation === 'store' ? (<SelectItems data={data} onSubmit={handleSubmit} setOperation={setOperation} />) : operation === 'dispatch' ? (<SelectItems data={data} onSubmit={handleSubmit} setOperation={setOperation} />) : null} */}
                        {type === 'view' && (<MyGrid title={data?.table} loading={modalLoading} data={modalData} currentPage={currentPage} pageSize={pageSize} total={total} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />)}
                        {/* {type === 'create' && modalName === 'PO' && (<CreatePO defaultValues={data} onCancel={onClose} />)} */}
                        {/* {type === 'add-item' && (<ItemDetailsForm values={data} onSubmit={(data) => { onAction({ type, payload: data, operation }); onClose(); }} />)} */}
                        {type === 'upload_pdf' && (<PDFUpload onSubmit={handleSubmit} onCancel={onClose} setOperation={setOperation} />)}
                        {type === 'view-status' && modalData?.length > 0 && (<ItemHistory data={modalData} />)}
                        {type === 'create' && (<AddSubItem subItemName={modalName} defaultValues={data} operation={'create'} AfterAction={onAction} onCancel={onClose} />)}
                        {type === 'update' && (<AddSubItem subItemName={modalName} defaultValues={data?.params} operation={'update'} AfterAction={onAction} onCancel={onClose} />)}
                        {type === 'delete' && (<div className="max-w-sm flex flex-col justify-center items-center gap-1 mx-auto">
                            <Warning className="w-12 h-12 text-red-500 bg-red-50 rounded-full p-1 " />
                            <div className="px-4">
                                <h2 className="text-lg font-semibold">Are you sure?</h2>
                            </div>
                            <span className="text-sm text-gray-600 p-2 px-7">This action cannot be undone. All values associated with this {modalName ?? data?.table ?? "record"} will be lost.</span>
                            <div className=" w-full flex flex-col justify-center items-center gap-2">
                                <button onClick={() => handleSubmit([])} disabled={submitLoading} className={`w-full flex justify-center p-2 border-transparent rounded-md shadow-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                                    {submitLoading ? (
                                        <OnSubmitLoading />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                                <button onClick={onClose} className="w-full border-2 border-slate-100  p-2 text-gray-700 rounded-md hover:bg-slate-100">Cancel</button>
                            </div>
                        </div>)}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default memo(MainModal);