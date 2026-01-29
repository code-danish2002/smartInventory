import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Tag, Hash, Calendar, Box, Package, Briefcase } from 'lucide-react';
import api from '../api/apiCall';
import { ContentLoading } from '../globalLoading';
import NoDataAvailable from '../utils/NoDataUi';

const getDummyPoDetails = (poNumber) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                po_details: {
                    po_id: 101,
                    po_number: poNumber,
                    po_description: "Procurement of high-performance server components and networking gear for Data Center Expansion Phase 1.",
                    firm_id: 505,
                    firm_name: "Global Tech Solutions Inc.",
                    firm_address: "123 Industrial Way, Silicon Valley, CA",
                    contact_person_name: "John Doe",
                    contact_number: "+1-555-0199",
                    email_address: "j.doe@globaltech.com",
                    tender_number: "TND-2023-0045",
                    po_date_of_issue: "2023-11-15",
                    inspector_user: "Robert Wilson",
                    purchaser_user: "Sarah Jenkins",
                    po_created_at: "2023-11-10T10:00:00Z",
                    pdf_sign_type: "Digital"
                },
                data: [
                    {
                        po_line_item_id: 1,
                        line_number: "L001",
                        line_item_name: "Nvidia RTX 4090",
                        description: "24GB GDDR6X - Founder's Edition",
                        unit_price: 1599,
                        unit_measurement: "Units",
                        total_quantity: 10,
                        quantity_offered: 10,
                        quantity_inspected: 8,
                        warranty_start: "2024-01-01",
                        line_item_status: "Partially Inspected",
                        phase: "Phase 1"
                    },
                    {
                        po_line_item_id: 2,
                        line_number: "L002",
                        line_item_name: "CAT6 Ethernet Cable",
                        description: "100m Roll - Shielded",
                        unit_price: 45,
                        unit_measurement: "Rolls",
                        total_quantity: 50,
                        quantity_offered: 50,
                        quantity_inspected: 50,
                        warranty_start: "2023-12-01",
                        line_item_status: "Completed",
                        phase: "Phase 1"
                    }
                ]
            });
        }, 300); // 800ms simulation delay
    });
};

const StatusBadge = ({ status }) => {
    let classes = "";
    let color = "";
    switch (status) {
        case 'In Stock':
            classes = "bg-green-100 text-green-800 border-green-300";
            color = "text-green-600";
            break;
        case 'Shipped':
            classes = "bg-blue-100 text-blue-800 border-blue-300";
            color = "text-blue-600";
            break;
        case 'Dispatched':
            classes = "bg-purple-100 text-purple-800 border-purple-300";
            color = "text-purple-600";
            break;
        case 'Pending Install':
            classes = "bg-yellow-100 text-yellow-800 border-yellow-300";
            color = "text-yellow-600";
            break;
        case 'In process':
            classes = "bg-yellow-100 text-yellow-800 border-yellow-300";
            color = "text-yellow-600";
            break;
        default:
            classes = "bg-gray-100 text-gray-800 border-gray-300";
            color = "text-gray-600";
    }
    return (
        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${classes}`}>
            {status}
        </span>
    );
};

const CardDetail = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-2 text-gray-600 text-sm">
        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="font-medium">{label}:</span>
        <span className="truncate">{value}</span>
    </div>
);

const InventoryCard = ({ item, onPoClick }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col p-5">
            {/* Header: Serial Number & Status */}
            <div className="flex justify-between items-start mb-4 pb-2 border-b border-dashed border-gray-100">
                <div className="truncate flex flex-col">
                    <p className="text-xs font-semibold uppercase text-gray-500">Serial Number</p>
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                        {item.item_serial_number || 'Not Assigned'}
                    </h2>
                </div>
                <StatusBadge status={item.item_status} />
            </div>

            {/* Core Details */}
            <div className="flex-grow space-y-3 mb-5">
                <CardDetail icon={Package} label="Item Type / Make" value={`${item.item_type_name} / ${item.item_make_name}`} />
                <CardDetail icon={Box} label="Model / Part Code" value={`${item.item_model_name} / ${item.item_part_code}`} />
                <div className="flex items-center space-x-2">
                    <CardDetail icon={Calendar} label="P.O. Date" value={new Date(item.po_date_of_issue).toLocaleDateString()} />
                    <CardDetail icon={Hash} label="Project ID" value={item.project_number} />
                </div>
                <CardDetail icon={Briefcase} label="Line Name" value={`${item.line_item_name} - ${item.description}`} />
            </div>

            {/* Footer: Less critical but useful details */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">P.O. No:</span>
                    </div>
                    <span onClick={() => onPoClick(item.po_number)} className="font-mono text-gray-700 cursor-pointer hover:underline hover:text-blue-600">{item.po_number}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">Supplier:</span>
                    </div>
                    <span className="truncate max-w-[60%] text-right">{item.firm_name}</span>
                </div>
            </div>
        </div>
    );
};




// --- Main Component ---
const MyInventory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedPoData, setSelectedPoData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [searchTerm])

    const handlePoClick = async (poNumber) => {
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            // Replace with your actual endpoint for PO details
            const response = await getDummyPoDetails(poNumber);
            setSelectedPoData(response);
        } catch (err) {
            console.error("Error fetching PO details:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const getInventory = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: limit,
            };
            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await api.get('api/pos_flat', { params });

            if (response.data && response.data.data) {
                setData(response.data.data);
                if (response.data.pagination) {
                    setLimit(response.data.pagination.limit);
                    setTotal(response.data.pagination.total);
                    setTotalPages(response.data.pagination.totalPages);
                }
            } else {
                setError('No data found');
            }
        }
        catch (error) {
            console.log(error);
            //setError(error?.data?.message || 'Unable to connect to the server. Please check your connection and try again later.');
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getInventory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (error) {
        return <NoDataAvailable title='Data Fetch Error' explanation={error} />
    }


    return (
        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl shadow-inner h-full flex flex-col">
            <div className="flex w-full justify-between items-center mb-2">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search all fields (Serial Number, P.O., etc.)"
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                    />
                </div>
            </div>
            {/* Card Grid */}
            <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2"> {/* Scrollable area */}
                {loading ? (
                    <ContentLoading />
                ) :
                    data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                            <PODetailsModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                data={selectedPoData}
                                loading={modalLoading}
                            />
                            {data.map((item) => (
                                <InventoryCard key={item.item_serial_number} item={item} onPoClick={handlePoClick} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-lg text-gray-500">{error || 'Something went wrong, no data found.'}</p>
                        </div>
                    )}
            </div>

            {/* Pagination Controls */}
            <div className="pt-4 flex flex-col sm:flex-row justify-end items-center border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                        Limit:
                    </div>
                    <select
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value));
                            setPage(1); // Reset to first page on limit change
                        }}
                        value={limit}
                        className="py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="6">6</option>
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="48">48</option>
                    </select>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm ml-2 font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </button>
                    <input type="number" value={page} min={1} max={totalPages} step={1} placeholder={page} onChange={(e) => setPage(parseInt(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && handlePageChange(parseInt(e.target.value))} className="py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    <span className="text-sm text-gray-500 flex items-center"> of {totalPages}</span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages || totalPages === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyInventory;


const PODetailsModal = ({ isOpen, onClose, data, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">Purchase Order Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronRight className="rotate-90 w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <ContentLoading />
                    ) : data ? (
                        <div className="space-y-6">
                            {/* PO Header Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold">PO Number</p>
                                    <p className="text-lg font-mono font-semibold">{data.po_details.po_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold">Firm / Supplier</p>
                                    <p className="text-lg font-semibold">{data.po_details.firm_name}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs text-blue-600 uppercase font-bold">Description</p>
                                    <p className="text-sm text-gray-700">{data.po_details.po_description}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold">Contact</p>
                                    <p className="text-sm">{data.po_details.contact_person_name} ({data.po_details.contact_number})</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold">Date of Issue</p>
                                    <p className="text-sm">{new Date(data.po_details.po_date_of_issue).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div>
                                <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center">
                                    <Box className="w-4 h-4 mr-2 text-blue-500" /> Line Items
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Inspected</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                            {data.data.map((line) => (
                                                <tr key={line.po_line_item_id}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900">{line.line_item_name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{line.description}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{line.total_quantity}</td>
                                                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{line.quantity_inspected}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{line.line_item_status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <NoDataAvailable title="Error" explanation="Failed to load PO details." />
                    )}
                </div>
            </div>
        </div>
    );
};