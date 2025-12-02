import React, { useState } from 'react';
import { RefreshCw, FileText, Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import { commonSelectProps } from '../../utils/CommonCSS';
import api from '../../api/apiCall';

const getStatusProps = (status) => {
    switch (status) {
        case 'Pending Review':
            return { color: 'text-yellow-600 bg-yellow-100', icon: Clock };
        case 'Approved - Awaiting Shipment':
            return { color: 'text-blue-600 bg-blue-100', icon: Package };
        case 'In Transit - Repairing':
            return { color: 'text-indigo-600 bg-indigo-100', icon: RefreshCw };
        case 'Completed - Shipped Back':
            return { color: 'text-green-600 bg-green-100', icon: CheckCircle };
        case 'Rejected':
            return { color: 'text-red-600 bg-red-100', icon: XCircle };
        default:
            return { color: 'text-gray-600 bg-gray-100', icon: FileText };
    }
};
const RmaDashboard = ({ rmaList }) => {
    const [expandedId, setExpandedId] = useState(null);

    const [dispatchDetails, setDispatchDetails] = useState({});

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-h-[70vh] bg-white p-6 rounded-xl shadow-lg border border-gray-100 overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-teal-600" />
                Track Existing RMA Status ({rmaList.length})
            </h2>
            <div className="space-y-4">
                {rmaList.length === 0 ? (
                    <p className="text-gray-500 italic p-4 border rounded-lg">No RMA requests found. Initiate a new one!</p>
                ) : (
                    rmaList.map((rma) => {
                        const isExpanded = expandedId === rma.id;
                        const { color, icon: StatusIcon } = getStatusProps(rma.status);

                        return (
                            <div
                                key={rma.id}
                                className="border border-gray-200 rounded-xl hover:shadow-lg transition duration-200 overflow-hidden"
                            >
                                {/* Header Row */}
                                <div
                                    className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                                    onClick={() => toggleExpand(rma.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-500 truncate">{rma.product} / {rma.serialNumber}</p>
                                        <p className="text-lg font-semibold text-gray-900">{rma.id}</p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${color}`}>
                                            <StatusIcon className="w-4 h-4 mr-1" />
                                            {rma.status}
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-700">Date Requested:</p>
                                                <p className="text-gray-900">{rma.dateRequested}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">Tracking Number:</p>
                                                <p className="text-gray-900">{rma.trackingNumber || 'N/A'}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="font-medium text-gray-700">Fault/Issue Description:</p>
                                                <p className="text-gray-900 whitespace-pre-wrap italic bg-gray-50 p-3 rounded-lg border">{rma.faultDescription}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="font-medium text-gray-700">Internal Resolution/Notes:</p>
                                                <p className="text-gray-900 whitespace-pre-wrap font-mono text-xs">{rma.resolution}</p>
                                            </div>
                                            {rma.status === 'Completed - Shipped Back' && <div>
                                                <button
                                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-200"
                                                >
                                                    Send for Live
                                                </button>
                                            </div>}
                                            {rma.status === 'Pending Review' &&
                                                <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {/* Tracking ID */}
                                                    <div className="flex flex-col">
                                                        <label className="text-sm font-medium text-gray-700 mb-1">
                                                            Tracking ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter Tracking ID"
                                                            className="px-3 py-2.5 border border-gray-300 rounded-lg w-full"
                                                            value={dispatchDetails?.tracking_id}
                                                            onChange={(e) =>
                                                                setDispatchDetails(prev => ({ ...prev, tracking_id: e.target.value }))
                                                            }
                                                        />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-sm font-medium text-gray-700 mb-1">
                                                            Location
                                                        </label>
                                                        <AsyncSelect
                                                            cacheOptions
                                                            loadOptions={async (inputValue) => {
                                                                if (inputValue.length <= 2) return [];
                                                                return await api
                                                                    .get('/api/stores/searchByStoreName', {
                                                                        params: { search: inputValue }
                                                                    })
                                                                    .then(res =>
                                                                        res.data.data.map(s => ({
                                                                            value: s.store_id,
                                                                            label: s.store_name
                                                                        }))
                                                                    )
                                                                    .catch((e) => {
                                                                        console.error('Error loading options', e);
                                                                        return [];
                                                                    });
                                                            }}
                                                            isClearable
                                                            placeholder="Type Location"
                                                            value={dispatchDetails?.location}
                                                            onChange={(option) =>
                                                                setDispatchDetails(prev => ({ ...prev, location: option }))
                                                            }
                                                            className="w-full"
                                                            classNamePrefix="react-select"
                                                            {...commonSelectProps}
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <button
                                                            className={`px-4 py-2 md:px-12 md:py-3 rounded-lg w-full md:w-auto text-white transition ${dispatchDetails?.tracking_id && dispatchDetails?.location
                                                                    ? "bg-teal-600 hover:bg-teal-700"
                                                                    : "bg-gray-400 cursor-not-allowed"
                                                                }`}
                                                            disabled={!(dispatchDetails?.tracking_id && dispatchDetails?.location)}
                                                            onClick={() => console.log(dispatchDetails)}
                                                        >
                                                            Dispatch
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RmaDashboard;