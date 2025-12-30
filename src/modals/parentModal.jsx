// src/modals/parentModal.jsx (The new, simpler version)
import { useState, memo } from "react";
import Modal from "react-modal";
import { Maximize2, Minimize2, X } from "lucide-react";
// Import all content components
import MyGrid from "../components/NewDataTable.jsx";
import PDFUpload from "./pdfUpload.jsx";
import ItemHistory from "../itemHistory.jsx";
import LiveOrSpare from "./liveOrSpare.jsx";
import HelpAndSupport from "./help&support.jsx";
import AddSubItem from "./add-new-subItem.jsx";
import ProjectNumberEdit from "./projectEditForm.jsx";
import { OnSubmitLoading, Warning } from "../utils/icons.jsx";
// Import the new hook
import { useModalLogic } from "../hooks/useModalLogic.js";
import GlobalLoading from "../globalLoading.jsx";

const VIEW_TYPES = ['view', 'view-status'];

// Helper to map type/modalName to the actual component
const ModalContentMapper = ({ type, modalName, data, modalLogic }) => {
    const { modalData, modalLoading, handleSubmit, onAction, onClose } = modalLogic;
    // The most complex logic is the approval/rejection block
    if (type === 'request-approval') {
        const [remarks, setRemarks] = useState("");
        const { submitLoading } = modalLogic;
        return (
            <div className="flex flex-col gap-6 p-4 min-w-[300px]">
                <p className="text-lg text-gray-700">Please accept or reject the request.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleSubmit({ po_item_details_ids: data?.body?.po_item_details_ids, action: "approve", remarks: "" })}
                        disabled={submitLoading}
                        className={`flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-w-[140px] ${submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {submitLoading ? <OnSubmitLoading /> : "Approve"}
                    </button>
                    <button
                        onClick={() => {
                            if (!remarks.trim()) {
                                alert("Please provide remarks for rejection.");
                                return;
                            }
                            handleSubmit({ po_item_details_ids: data?.body?.po_item_details_ids, action: "reject", remarks });
                        }}
                        disabled={submitLoading}
                        className={`flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 min-w-[140px] ${submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {submitLoading ? <OnSubmitLoading /> : "Reject"}
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-lg text-gray-700">Remarks:</p>
                    <textarea
                        placeholder="Enter remarks in case of rejection only..."
                        className="border border-gray-300 p-2 rounded-md"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={submitLoading}
                    />
                </div>
            </div>
        );
    }

    // Map other types
    switch (type) {
        case 'view':
            return modalData ? (
                <MyGrid
                    title={modalName || data?.table || ''}
                    loading={modalLoading}
                    data={modalData}
                    currentPage={modalLogic.currentPage}
                    pageSize={modalLogic.pageSize}
                    total={modalLogic.total}
                    onPageChange={modalLogic.setCurrentPage}
                    onPageSizeChange={modalLogic.setPageSize}
                    onSearchTermChange={modalLogic.setSearchQuery}
                    refreshData={() => modalLogic.fetchViewData({ resetPage: true })}
                />
            ) : null;
        case 'view-status':
            return modalData && modalData.length > 0 ? <ItemHistory data={modalData} /> : null;
        case 'upload_pdf':
            return <PDFUpload onSubmit={handleSubmit} onCancel={modalLogic.onClose} setOperation={() => { }} />;
        case 'create':
            return <AddSubItem subItemName={modalName} defaultValues={data} operation={'create'} AfterAction={modalLogic.onAction} onCancel={modalLogic.onClose} />;
        case 'update':
            return <AddSubItem subItemName={modalName} defaultValues={data?.params} operation={'update'} AfterAction={modalLogic.onAction} onCancel={modalLogic.onClose} />;
        case 'delete':
            return (
                // Delete confirmation UI (same as before, but calls the hook's handleSubmit)
                <div className="max-w-sm flex flex-col justify-center items-center gap-1 mx-auto">
                    <Warning className="w-12 h-12 text-red-500 bg-red-50 rounded-full p-1 " />
                    <div className="px-4">
                        <h2 className="text-lg font-semibold">Are you sure?</h2>
                    </div>
                    <span className="text-sm text-gray-600 p-2 px-7">This action cannot be undone.</span>
                    <div className=" w-full flex flex-col justify-center items-center gap-2">
                        <button onClick={() => handleSubmit([])} disabled={modalLogic.submitLoading} className={`w-full flex justify-center p-2 border-transparent rounded-md shadow-sm font-medium text-white bg-red-500 hover:bg-red-600 ${modalLogic.submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {modalLogic.submitLoading ? <OnSubmitLoading /> : "Delete"}
                        </button>
                        <button onClick={modalLogic.onClose} className="w-full border-2 border-slate-100 p-2 text-gray-700 rounded-md hover:bg-slate-100">Cancel</button>
                    </div>
                </div>
            );
        case 'send to location':
            return <LiveOrSpare po_item_details_ids={data?.body} onClose={modalLogic.onClose} onAction={modalLogic.onAction} />;
        case 'edit-project-number':
            // Pass a refresh function to ProjectNumberEdit that tells the grid to re-fetch/re-render.
            return <ProjectNumberEdit onClose={modalLogic.onClose} onSubmit={modalLogic.onAction} selectedItems={data?.body} />;
        case 'help&support':
            return <HelpAndSupport />;
        case 'store':
        case 'dispatch':
            return (
                <div className="p-4 text-center text-gray-500">
                    {`${type} form content goes here.`}
                    <button
                        onClick={() => handleSubmit({ /* store/dispatch payload */ })}
                        disabled={modalLogic.submitLoading}
                        className={`mt-4 py-2 px-4 bg-green-600 text-white rounded-lg ${modalLogic.submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {modalLogic.submitLoading ? <OnSubmitLoading /> : "Confirm Action"}
                    </button>
                </div>
            );
        default:
            return <div className="p-4 text-center text-gray-500">Unknown Action Type: {type}</div>;
    }
};


const MainModal = ({ modalName, isOpen, onClose, type, data, onAction }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    console.log('modalName', modalName, isOpen, type, data);
    if (!isOpen) return null;
    // Call the custom hook to get all logic and state
    const modalLogic = useModalLogic({ type, modalName, data, isOpen, onAction, onClose });
    const { modalLoading, fetchError, modalData } = modalLogic;

    const isViewType = VIEW_TYPES.includes(type);
    const dataEmptyOrFailed = !modalLoading && (fetchError || (isViewType && modalData && modalData.length === 0));

    // Handle Loading/Error States for View Types
    if (isViewType && (modalLoading || dataEmptyOrFailed) && isOpen) {
        return (
            <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto" overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" shouldCloseOnEsc={true} shouldCloseOnOverlayClick={true}>
                <div className="bg-white shadow-2xl overflow-hidden flex flex-col w-max max-w-6xl rounded-2xl">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">{modalName || data?.table || ''}</h2>
                        <button onClick={onClose} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">&times;</button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-8 min-w-[300px]">
                        {modalLoading ? <GlobalLoading /> : (<><Warning className="w-12 h-12 text-red-500 bg-red-50 rounded-full p-1 " /><div className="px-4"><h2 className="text-lg font-semibold">Record not found</h2></div></>)}
                    </div>
                </div>
            </Modal>
        );
    }

    const containerClass = isFullScreen ? 'absolute inset-0 m-0 w-full h-full rounded-none' : 'w-max max-w-6xl rounded-2xl';

    const getModalTitle = () => {
        // (Your existing getModalTitle logic goes here, using type and modalName)
        switch (type) {
            case 'request-approval': return `Approval Required`;
            case 'view-status': return 'Item History';
            case 'upload_pdf': return 'Upload PDF';
            case 'send to location': return 'Send to Location';
            case 'help&support': return 'Help & Support';
            case 'create':
            case 'update':
            case 'delete':
                if (['Type', 'Make', 'Model', 'Part', 'Firm', 'Stores'].includes(modalName)) {
                    const action = type === 'create' ? 'Add' : type === 'update' ? 'Edit' : 'Delete';
                    return `${action} ${modalName || data?.table || ''}`;
                }
                return `${type.charAt(0).toUpperCase() + type.slice(1)} ${modalName || data?.table || ''}`;
            default: return modalName || data?.table || 'Modal';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 max-h-full overflow-auto"
            overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
        >
            <div className={`bg-white shadow-2xl overflow-hidden flex flex-col ${containerClass}`}>
                <div className="bg-gray-50 gap-4 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{getModalTitle()}</h2>
                    <div className="flex items-center gap-3">
                        {(isViewType || type === 'create' || type === 'upload_pdf') &&
                            <button
                                onClick={() => setIsFullScreen((f) => !f)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                                aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
                            >
                                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>}
                        <button onClick={onClose} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                {/* Content Area - Delegated to Mapper */}
                <div className="overflow-auto p-4 flex-1">
                    <ModalContentMapper type={type} modalName={modalName} data={data} modalLogic={{ ...modalLogic, onAction, onClose }} />
                </div>
            </div>
        </Modal>
    );
};

export default memo(MainModal);