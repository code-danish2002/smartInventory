import React, { useEffect, useState } from 'react';
import { RefreshCw, FileText, Package, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AsyncSelect from 'react-select/async';
import { commonSelectProps } from '../../utils/CommonCSS';
import { useToast } from '../../context/toastProvider';
import api from '../../api/apiCall';
import { ContentLoading } from '../../globalLoading';
import { useAuth } from '../../context/authContext';
import ParentModal from '../../modals/parentModal';
import NoDataAvailable from '../../utils/NoDataUi';

const getStatusProps = (status) => {
    switch (status) {
        case 'RMA Generated':
            return { color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30', icon: Clock };
        case 'Dispatch Initiated':
            return { color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30', icon: Package };
        case 'Item Received':
            return { color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30', icon: CheckCircle };
        case 'Rejected':
            return { color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30', icon: XCircle };
        default:
            return { color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-slate-800', icon: FileText };
    }
};
const RmaDashboard = () => {
    const [rmaList, setRmaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const addToast = useToast();
    const [expandedId, setExpandedId] = useState(null);
    const [dispatchDetails, setDispatchDetails] = useState({});
    const [historyModal, setHistoryModal] = useState({ open: false, type: null, data: null, parentRow: null, table: null });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState(null);
    const [error, setError] = useState(null);
    const { groups } = useAuth();

    const isRelationshipEngineer = groups.includes('item-inspection-relation-engineer');
    //const isAdmin = groups.includes('item-inspection-admin');
    //const isDispatchEnabled = isRelationshipEngineer && isAdmin || !isRelationshipEngineer && isAdmin || !isRelationshipEngineer && !isAdmin;

    useEffect(() => {
        if (!loading) {
            setLoading(true);
        }
        api.get('/api/rma', {
            params: {
                page: currentPage,
                limit: limit,
                search: search
            }
        })
            .then((res) => {
                if (res?.data?.data?.length > 0) {
                    setRmaList(res.data.data);
                    setCurrentPage(res.data.pagination.page);
                    setTotalPages(res.data.pagination.totalPages);
                    setLimit(res.data.pagination.limit);
                    setTotalRecords(res.data.pagination.total);
                }
                // else {
                //     setRmaList([]);
                //     setCurrentPage(1);
                //     setTotalPages(0);
                //     setLimit(10);
                //     setTotalRecords(0);
                // }
            })
            .catch((error) => setError(error?.response?.data?.message || error?.response?.data?.error || "Unable to connect to the server. Please check your connection and try again later."))
            .finally(() => setLoading(false));
    }, [refreshData, currentPage, limit, search]);
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-h-[75vh] h-full bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 flex flex-col">
            <div className="flex flex-wrap items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center flex-wrap truncate">
                    <Package className="w-6 h-6 mr-2 text-teal-600 dark:text-teal-400" />
                    Track RMA Status ({rmaList.length})
                </h2>
                <div className="relative w-full hidden md:block md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search RMA"
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                        value={search || ''}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {loading ? (<ContentLoading />)
                    : rmaList.length === 0 ? (
                        <NoDataAvailable title={error ? 'Data Fetch Error' : 'No Data Found'} explanation={error || 'No RMA requests found. Initiate a new one!'} />
                    ) : (
                        rmaList.map((rma) => {
                            const isExpanded = expandedId === rma.rma_id;
                            const { color, icon: StatusIcon } = getStatusProps(rma.item_status);

                            return (
                                <div
                                    key={rma.rma_id}
                                    className="border border-gray-200 dark:border-slate-800 rounded-xl hover:shadow-lg transition duration-200 overflow-hidden"
                                >
                                    {/* Header Row */}
                                    <div
                                        className="p-4 bg-gray-50 dark:bg-slate-800/50 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleExpand(rma.rma_id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">{rma.product_name || 'N/A'} / {rma.serial_number || rma.old_serial_number_at_rma || rma.new_serial_number}</p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{rma.rma_number}</p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${color}`}>
                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                {rma.item_status}
                                            </span>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500 dark:text-slate-400" /> : <ChevronDown className="w-5 h-5 text-gray-500 dark:text-slate-400" />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Fault Date:</p>
                                                    <p className="text-gray-900 dark:text-slate-100">{new Date(rma.fault_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Date Requested:</p>
                                                    <p className="text-gray-900 dark:text-slate-100">{new Date(rma.rma_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Tracking Number:</p>
                                                    <p className="text-gray-900 dark:text-slate-100">{rma.tracking_id || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Case Number:</p>
                                                    <p className="text-gray-900 dark:text-slate-100">{rma.case_number || 'N/A'}</p>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Fault/Issue Description:</p>
                                                    <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap italic bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">{rma.detailed_fault_description || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Severity:</p>
                                                    <p className="text-gray-900 dark:text-slate-100">{rma.severity || 'N/A'}</p>
                                                </div>
                                                <div className="sm:col-span-1">
                                                    <p className="font-medium text-gray-700 dark:text-slate-300">Internal Resolution/Notes:</p>
                                                    <p className="text-gray-900 dark:text-slate-100 whitespace-pre-wrap font-mono text-xs">{rma.requested_resolution}</p>
                                                </div>
                                                {rma.item_status === 'Dispatch Initiated' && isRelationshipEngineer && <div>
                                                    <button
                                                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition duration-200"
                                                        onClick={() => {
                                                            api.put(`/api/rma/${rma.rma_id}/receive`, { item_location: rma.item_location })
                                                                .then((res) => {
                                                                    addToast(res);
                                                                    setRefreshData(!refreshData);
                                                                })
                                                                .catch((e) => {
                                                                    addToast(e);
                                                                    console.log(e);
                                                                })
                                                        }}
                                                    >
                                                        Receive
                                                    </button>
                                                </div>}
                                                {(rma.item_status === 'RMA Generated' && !isRelationshipEngineer) &&
                                                    <div id={rma.rma_id} className="sm:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {/* Tracking ID */}
                                                        <div className="flex flex-col">
                                                            <label className="text-sm font-medium text-gray-700 mb-1">
                                                                Tracking ID
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Tracking ID"
                                                                className="px-3 py-2.5 border border-gray-300 rounded-lg w-full"
                                                                value={dispatchDetails[rma.rma_id]?.tracking_id || ''}
                                                                onChange={(e) =>
                                                                    setDispatchDetails((prev) => ({
                                                                        ...prev,
                                                                        [rma.rma_id]: { ...prev[rma.rma_id], tracking_id: e.target.value },
                                                                    }))
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-end">
                                                            <button
                                                                className={`px-4 py-2 md:px-12 md:py-3 rounded-lg w-full md:w-auto text-white transition ${dispatchDetails[rma.rma_id]?.tracking_id
                                                                    ? "bg-teal-600 hover:bg-teal-700"
                                                                    : "bg-gray-400 cursor-not-allowed"
                                                                    }`}
                                                                disabled={!dispatchDetails[rma.rma_id]?.tracking_id}
                                                                onClick={() => {
                                                                    const currentTrackingId = dispatchDetails[rma.rma_id]?.tracking_id;
                                                                    api.put(`/api/rma/${rma.rma_id}`, {
                                                                        tracking_id: currentTrackingId,
                                                                    })
                                                                        .then((res) => {
                                                                            addToast(res);
                                                                            setDispatchDetails(prev => {
                                                                                const newState = { ...prev };
                                                                                delete newState[rma.rma_id];
                                                                                return newState;
                                                                            });
                                                                            setRefreshData(!refreshData);
                                                                        })
                                                                        .catch((error) => {
                                                                            console.log(error);
                                                                            addToast(error);
                                                                        });
                                                                }}
                                                            >
                                                                Dispatch
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div className="flex justify-between items-end">
                                                {rma?.item_status === "Item Received" ? (
                                                    <div className="flex items-end">
                                                        <p className="text-red-600 dark:text-red-400">Case Resolved</p>
                                                    </div>
                                                ) : (
                                                    <span>&nbsp;</span>
                                                )}
                                                {/* {button for history} */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setHistoryModal({ open: true, type: 'view-status', data: { params: { rma_id: rma.rma_id, po_item_details_id: rma.po_item_details_id } }, parentRow: rma, table: 'RMA' });
                                                    }}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-semibold underline focus:outline-none"
                                                >
                                                    View History
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
            </div>
            {/* footer having pagination part */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 mt-4 flex-none">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-300 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 dark:text-slate-600' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-700 dark:text-slate-300">
                            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * limit, totalRecords)}</span> of{' '}
                            <span className="font-medium">{totalRecords}</span> records
                        </p>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1); // Reset to first page when limit changes
                            }}
                            className="block w-20 rounded-md border-0 py-1.5 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        >
                            {[7, 10, 15, 25, 50].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 dark:ring-slate-700 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                // Logic to show limited page numbers can be added here if needed
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-slate-700 focus:z-20 focus:outline-offset-0 ${currentPage === pageNumber
                                            ? 'bg-teal-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'
                                            : 'text-gray-900 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 dark:ring-slate-700 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
            {historyModal.open && <ParentModal
                modalName={'RMA History'}
                isOpen={historyModal.open}
                type={historyModal.type}
                onClose={() => setHistoryModal({ open: false, data: null })}
                data={historyModal.data}
                parentRow={historyModal.parentRow}
                table={historyModal.table}
            />}
        </div>
    );
};

export default RmaDashboard;