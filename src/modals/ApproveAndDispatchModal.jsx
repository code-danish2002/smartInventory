import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { ContentLoading } from "../globalLoading";
import api from "../api/apiCall";

const fetchContent = async (po_id) => {
    const response = await api.get(`/api/po/${po_id}`);
    return response.data;
}

const ApproveAndDispatch = ({ isOpen, onClose, po_id }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetchContent(po_id).then(data => {
            setContent(data.data);
        });
    }, []);
    const handleApproval = async ({ body }) => {
        const thisBody = { ...body, po_id };
        setLoading(true);
        await api.post('/api/po-actions', thisBody).then(response => {
            addToast(response);
            fetchContent(po_id).then(data => {
                setContent(data.data);
            })
        }).catch(err => {
            console.log(err);
            addToast(err);
        }).finally(() => {
            onCancel();
        });
        setError(null);
        setContent("Pending for Dispatch");
        console.log(body);
    }
    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            ariaHideApp={false}
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
        >
            {loading ? (
                <ContentLoading />
            ) : (<div className="bg-white shadow-2xl overflow-hidden flex flex-col w-max max-w-6xl rounded-2xl">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Approve and Dispatch</h2>
                    <button onClick={onClose} className="text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-300 text-lg">&times;</button>
                </div>
                {
                    content === "Pending for Approval" ? (
                        // show approve or reject modal
                        <div className="flex flex-col items-center justify-center gap-2 p-8 min-w-[300px]">
                            <p className="text-lg font-semibold">Needs your Approval first</p>
                            <div className="flex flex-col sm:flex-row w-full">
                                <button className="bg-green-400 hover:bg-green-500" onClick={() => handleApproval({ action: "approve" })}>Approve</button>
                                <button className="bg-red-400 hover:bg-red-500">Reject</button>
                            </div>
                        </div>
                    ) : content === "Ready for Dispatch" ? (
                        // show dispatch modal
                        <div className="flex flex-col items-center justify-center gap-2 p-8 min-w-[300px]">
                            <p className="text-lg font-semibold">Ready for Dispatch</p>
                            <div className="flex flex-col sm:flex-row w-full">
                                <button className="bg-green-400 hover:bg-green-500">Dispatch</button>
                            </div>
                        </div>
                    ) :
                        (
                            <div className="flex flex-col items-center justify-center gap-2 p-8 min-w-[300px]">
                                <Warning className="w-12 h-12 text-red-500 bg-red-50 rounded-full p-1 " />
                                <div className="px-4">
                                    <h2 className="text-lg font-semibold">Record not found</h2>
                                </div>
                            </div>
                        )
                }
            </div>

            )}
        </ReactModal>
    );
};

export default ApproveAndDispatch;

export async function DispatchContentActivity(data){
    return(
        <div>
            <p></p>
        </div>
    )
}