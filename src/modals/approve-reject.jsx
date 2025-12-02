import React, { useState, useCallback } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import api from '../api/apiCall';
import { useToast } from '../context/toastProvider';
import Modal from 'react-modal';
import ReactModal from 'react-modal';

// --- ApproveOrRejectModal Component ---
const ApproveOrReject = ({ isOpen, onClose, params, requestFor, onSuccess }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const addToast = useToast();

    // Reset state when closing
    const handleClose = useCallback(() => {
        setIsRejecting(false);
        setRejectionReason('');
        onClose();
    }, [onClose]);

    const handleRejectClick = () => {
        // Toggle to show the rejection input field
        setIsRejecting(true);
    };

    const handleCancelReject = () => {
        // Cancel rejection input and go back to initial state
        setIsRejecting(false);
        setRejectionReason('');
    };

    const handleApproveReject = async ({ action }) => {
        // Pass the rejection reason to the parent
        const body = { action, ...params }; // params passed via props
        if (action === 'reject') {
            body.remarks = rejectionReason;
        }
        console.log("body", body);
        api.post('/api/po-actions', body)
            .then(response => { addToast(response); onSuccess(); })
            .catch(err => { addToast(err); })
            .finally(() => {
                handleClose();
            });
    };

    if (!isOpen) return null;

    return (
        // Modal Overlay (Full screen background)
        <ReactModal
            isOpen={true}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
            overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40"
            contentLabel="Item Inspection"
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
        >
            {/* Modal Content Card */}
            <div className="bg-white relative rounded-xl shadow-2xl w-full max-w-lg transition-transform duration-300 transform scale-100">

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-extrabold text-gray-900">
                        {isRejecting ? "Provide Rejection Reason" : "Review Action Required"}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="mb-6 text-gray-700">
                        {isRejecting
                            ? "Please provide mandatory remarks explaining why this item is being rejected."
                            : "This PO requires your approval?"}
                    </p>

                    {isRejecting && (
                        <div className="mb-6">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 mb-2">
                                Rejection Remarks
                            </label>
                            <textarea
                                id="reason"
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 resize-none"
                                placeholder="Enter reason here..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                            {rejectionReason.length < 10 && (
                                <p className="mt-1 text-xs text-red-500">
                                    Reason should be at least 10 characters long.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 flex justify-end gap-3 bg-gray-50 rounded-b-xl border-t border-gray-200">

                    {/* General Close Button */}
                    {!isRejecting && (
                        <button
                            onClick={handleClose}
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Close
                        </button>
                    )}

                    {/* Rejecting State Buttons */}
                    {isRejecting ? (
                        <>
                            <button
                                onClick={handleCancelReject}
                                className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Cancel Reject
                            </button>
                            <button
                                onClick={() => handleApproveReject({ action: 'reject' })}
                                disabled={rejectionReason.length < 10}
                                className={`flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all ${rejectionReason.length < 10
                                    ? 'bg-red-300 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 shadow-md'
                                    }`}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Confirm Rejection
                            </button>
                        </>
                    ) : (
                        // Initial State Buttons
                        <>
                            <button
                                onClick={handleRejectClick}
                                className="flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                            </button>
                            <button
                                onClick={() => handleApproveReject({ action: 'approve' })}
                                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition-colors"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>
        </ReactModal>
    );
};

export default ApproveOrReject;