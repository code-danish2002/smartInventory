import Modal from 'react-modal';
import { useState, useEffect } from 'react';

export default function ConfirmationModal({
  isOpen,
  actionType,    // 'approve' | 'reject'
  itemName,
  po_id,
  onCancel,
  submitModal,     // (remark?: string) => void
  loading = false,
}) {
  const [remarks, setRemark] = useState('');

  // reset remark whenever modal re‑opens
  useEffect(() => {
    if (isOpen && actionType === 'reject') {
      setRemark('');
    }
  }, [isOpen, actionType]);

  const title =
    actionType === 'approve'
      ? `Approve “${itemName}”?`
      : `Add Remarks to Reject “${itemName}”?`;

  const handleSubmit = (e) => {
    e.preventDefault();
    actionType === 'approve' ? submitModal({ action: 'approve', pdf_sign_type: 'Digitally_Esign' }) : actionType === 'reject' ? submitModal({ action: 'reject', remarks }) : onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
          <button onClick={onCancel} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-lg">
            &times;
          </button>
        </div>

        {actionType === 'approve' ? (
          <p className="text-gray-600 mb-6">
            Please confirm, would you like to digitally sign certificate for this Line Item.
          </p>
        ) : (
          <>
            <textarea
              rows={4}
              placeholder="Enter remarks..."
              className="w-full p-2 mb-4 border rounded-md focus:ring focus:ring-opacity-50"
              value={remarks}
              onChange={(e) => setRemark(e.target.value)}
            />
          </>
        )}

        <div className="flex justify-center gap-4">
          {actionType === 'approve' && (
            <button
              title='Click to approve without physically signing'
              onClick={() => submitModal({ action: 'approve', pdf_sign_type: 'Physically_Sign' })}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-full text-white bg-amber-600 hover:bg-amber-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              No
            </button>
          )}
          <button
            onClick={(e) => handleSubmit(e)}
            disabled={actionType === 'reject' && remarks.trim() === '' || loading}
            className={`w-full px-4 py-2 rounded-full text-white ${actionType === 'approve'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
              } ${actionType === 'reject' && remarks.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionType === 'approve' ? 'Yes' : 'Yes, reject'}
          </button>
        </div>
      </div>
    </Modal>
  );
}