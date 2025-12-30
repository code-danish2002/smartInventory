import { useState } from "react";
import api from "../api/apiCall";
import { useToast } from "../context/toastProvider";
import { Live } from "../utils/icons";
import { MdOutlineInventory } from "react-icons/md";

export default function LiveOrSpare({ po_item_details_ids, onClose, onAction}) {
    const [remarks, setRemarks] = useState("");
    const addToast = useToast();
    console.log(po_item_details_ids);
    async function handleSubmit(body) {
        api.post(`/api/spare_action/bulk`, body).then((res) => {
            addToast(res);
            onAction();
            onClose();
        }).catch((error) => { addToast(error); onClose(); });
    }
    return (
        <div className="flex flex-col gap-6 p-4">
                            <p className="text-lg text-gray-700">This Item needs to be handed over to the location.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        handleSubmit({ po_item_details_ids: po_item_details_ids, action: "spare", remarks });
                                    }}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-w-[140px]"
                                >
                                    Spare Inventory <MdOutlineInventory className="inline-block ml-0" />
                                </button>
                                <button
                                    onClick={() => {
                                        handleSubmit({ po_item_details_ids: po_item_details_ids, action: "live", remarks });
                                    }}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-w-[140px]"
                                >
                                    Live <Live className="inline-block ml-0" />
                                </button>
                            </div>

                            {/* Show remarks input only if Reject button is visible */}
                            <div className="flex flex-col gap-2">
                                <p className="text-lg text-gray-700">Remarks:</p>
                                <textarea
                                    placeholder="Optional"
                                    className="border border-gray-300 p-2 rounded-md"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>
    );
}