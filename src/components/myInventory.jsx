import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Tag, Hash, Calendar, Box, Package, Briefcase } from 'lucide-react';

// --- Static Data (Retained and slightly expanded) ---
const INITIAL_INVENTORY_DATA = [
    { "id": "item-1", "po_number": "1002410001", "firm_name": "Dr. Rahul Singh", "tender_number": "RCIL/2017/P&A/34/1", "po_date_of_issue": "2024-04-02T00:00:00.000Z", "line_number": 2, "line_name": "Professional Services", "item_type_name": "Core Router", "item_make_name": "Cisco", "item_model_name": "GOXQ28-13100G-LR4", "item_part_code": "GOXQ28-13100G-LR4", "item_part_description": "Cisco 100G Transceiver", "item_serial_number": "SN-2024-001", "project_number": 518, "status": "In Stock" },
    { "id": "item-2", "po_number": "1002410002", "firm_name": "Tech Solutions Corp", "tender_number": "RCIL/2018/INV/01/A", "po_date_of_issue": "2024-01-15T00:00:00.000Z", "line_number": 5, "line_name": "Hardware Supply", "item_type_name": "Access Switch", "item_make_name": "Juniper", "item_model_name": "EX4600", "item_part_code": "EX4600-48F-BF", "item_part_description": "Juniper Access Switch", "item_serial_number": "SN-2024-002", "project_number": 520, "status": "Shipped" },
    { "id": "item-3", "po_number": "1002410003", "firm_name": "Global Networking Ltd", "tender_number": "RCIL/2019/SER/10/B", "po_date_of_issue": "2023-11-20T00:00:00.000Z", "line_number": 1, "line_name": "Installation Services", "item_type_name": "Server Rack", "item_make_name": "HP", "item_model_name": "42U-Deep", "item_part_code": "42U-RK-001", "item_part_description": "Standard 42U Server Rack", "item_serial_number": "SN-2024-003", "project_number": 519, "status": "Pending Install" },
    { "id": "item-4", "po_number": "1002410004", "firm_name": "Infra Systems Inc", "tender_number": "RCIL/2020/SUP/22/C", "po_date_of_issue": "2023-09-01T00:00:00.000Z", "line_number": 3, "line_name": "Component Parts", "item_type_name": "Fiber Optic Cable", "item_make_name": "Corning", "item_model_name": "SMF-28", "item_part_code": "FO-SMF-10KM", "item_part_description": "Single-Mode Fiber, 10KM Spool", "item_serial_number": "SN-2024-004", "project_number": 521, "status": "In Stock" },
    { "id": "item-5", "po_number": "1002410005", "firm_name": "Data Stream Solutions", "tender_number": "RCIL/2021/OPT/33/D", "po_date_of_issue": "2023-07-10T00:00:00.000Z", "line_number": 7, "line_name": "Optical Components", "item_type_name": "Optical Transceiver", "item_make_name": "Finisar", "item_model_name": "FTLX1471D3BCL", "item_part_code": "FTLX1471D3BCL", "item_part_description": "10GBASE-LR SFP+", "item_serial_number": "SN-2024-005", "project_number": 522, "status": "Delivered" },
    { "id": "item-6", "po_number": "1002410006", "firm_name": "Network Innovators", "tender_number": "RCIL/2022/SEC/44/E", "po_date_of_issue": "2023-05-01T00:00:00.000Z", "line_number": 4, "line_name": "Security Hardware", "item_type_name": "Firewall Appliance", "item_make_name": "Palo Alto", "item_model_name": "PA-440", "item_part_code": "PA-440-ENT", "item_part_description": "Next-Gen Firewall", "item_serial_number": "SN-2024-006", "project_number": 523, "status": "In Stock" },
    { "id": "item-7", "po_number": "1002410007", "firm_name": "ConnectRight Partners", "tender_number": "RCIL/2023/CLOUD/55/F", "po_date_of_issue": "2023-03-22T00:00:00.000Z", "line_number": 6, "line_name": "Cloud Solutions", "item_type_name": "Cloud Gateway", "item_make_name": "VMware", "item_model_name": "NSX-T Edge", "item_part_code": "NSXT-EDGE-VM", "item_part_description": "Virtual Network Gateway", "item_serial_number": "SN-2024-007", "project_number": 524, "status": "Provisioned" },
    { "id": "item-8", "po_number": "1002410008", "firm_name": "ServerLink Services", "tender_number": "RCIL/2024/MAINT/66/G", "po_date_of_issue": "2023-01-10T00:00:00.000Z", "line_number": 8, "line_name": "Maintenance Contracts", "item_type_name": "UPS System", "item_make_name": "APC", "item_model_name": "Smart-UPS 1500", "item_part_code": "SMT1500", "item_part_description": "Uninterruptible Power Supply", "item_serial_number": "SN-2024-008", "project_number": 525, "status": "In Stock" },
    { "id": "item-9", "po_number": "1002410009", "firm_name": "Cabling Experts LLC", "tender_number": "RCIL/2024/CBL/77/H", "po_date_of_issue": "2022-11-05T00:00:00.000Z", "line_number": 9, "line_name": "Cabling Infrastructure", "item_type_name": "Ethernet Cable", "item_make_name": "CommScope", "item_model_name": "Cat6A F/UTP", "item_part_code": "CAT6A-1000FT", "item_part_description": "Category 6A Shielded Cable, 1000ft", "item_serial_number": "SN-2024-009", "project_number": 526, "status": "Shipped" },
    { "id": "item-10", "po_number": "1002410010", "firm_name": "Wireless World", "tender_number": "RCIL/2024/WLS/88/I", "po_date_of_issue": "2022-09-18T00:00:00.000Z", "line_number": 10, "line_name": "Wireless Solutions", "item_type_name": "Wireless Access Point", "item_make_name": "Ubiquiti", "item_model_name": "UniFi AP AC Pro", "item_part_code": "UAP-AC-PRO", "item_part_description": "Dual-Band Wi-Fi Access Point", "item_serial_number": "SN-2024-010", "project_number": 527, "status": "Pending Install" },
    { "id": "item-11", "po_number": "1002410011", "firm_name": "Edge Computing Solutions", "tender_number": "RCIL/2024/EDGE/01/J", "po_date_of_issue": "2022-07-01T00:00:00.000Z", "line_number": 1, "line_name": "Edge Devices", "item_type_name": "Edge Server", "item_make_name": "Dell EMC", "item_model_name": "PowerEdge XR2", "item_part_code": "XR2-COMPACT", "item_part_description": "Rugged Edge Server", "item_serial_number": "SN-2024-011", "project_number": 528, "status": "In Stock" },
    { "id": "item-12", "po_number": "1002410012", "firm_name": "Storage Solutions Inc", "tender_number": "RCIL/2024/STR/02/K", "po_date_of_issue": "2022-05-12T00:00:00.000Z", "line_number": 2, "line_name": "Data Storage", "item_type_name": "NAS Device", "item_make_name": "Synology", "item_model_name": "DS920+", "item_part_code": "DS920-PLUS", "item_part_description": "4-Bay NAS Enclosure", "item_serial_number": "SN-2024-012", "project_number": 529, "status": "Delivered" },
    // Duplicating and adding more data (Total ~50 records for effective demo)
    ...Array(38).fill(null).map((_, i) => ({
        "id": `item-${i + 13}`,
        "po_number": `20000000${i + 13}`,
        "firm_name": `Vendor ${String.fromCharCode(65 + i)} Ltd`,
        "tender_number": `RCIL/2024/G${i + 13}/X`,
        "po_date_of_issue": new Date(Date.now() - (i + 1) * 75000000).toISOString(),
        "line_number": (i % 10) + 1,
        "line_name": `Generic Line ${i + 1}`,
        "item_type_name": i % 4 === 0 ? "Server" : i % 4 === 1 ? "Patch Cable" : i % 4 === 2 ? "SAN Storage" : "IP Camera",
        "item_make_name": i % 4 === 0 ? "Dell" : i % 4 === 1 ? "Monoprice" : i % 4 === 2 ? "EMC" : "Axis",
        "item_model_name": `Model Y${i + 13}00`,
        "item_part_code": `PCODE-Y${i + 13}`,
        "item_part_description": `High-Quality Part ${i + 13}`,
        "item_serial_number": `SN-2024-0${i + 13}`,
        "project_number": 600 + (i % 8),
        "status": i % 4 === 0 ? "In Stock" : i % 4 === 1 ? "Shipped" : i % 4 === 2 ? "Delivered" : "Pending Install",
    }))
];

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
        case 'Delivered':
            classes = "bg-purple-100 text-purple-800 border-purple-300";
            color = "text-purple-600";
            break;
        case 'Pending Install':
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

const InventoryCard = ({ item }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col p-5">
            {/* Header: Serial Number & Status */}
            <div className="flex justify-between items-start mb-4 pb-2 border-b border-dashed border-gray-100">
                <div className="truncate flex flex-col">
                    <p className="text-xs font-semibold uppercase text-gray-500">Serial Number</p>
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                        {item.item_serial_number}
                    </h2>
                </div>
                <StatusBadge status={item.status} />
            </div>

            {/* Core Details */}
            <div className="flex-grow space-y-3 mb-5">
                <CardDetail icon={Package} label="Item Type" value={item.item_type_name} />
                <CardDetail icon={Box} label="Make / Model" value={`${item.item_make_name} / ${item.item_model_name}`} />
                <CardDetail icon={Calendar} label="P.O. Date" value={new Date(item.po_date_of_issue).toLocaleDateString()} />
                <CardDetail icon={Hash} label="Project ID" value={item.project_number} />
            </div>
            
            {/* Footer: Less critical but useful details */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">P.O. No:</span>
                    </div>
                    <span onClick={() => alert(`PO Number clicked ${item.po_number}`)} className="font-mono text-gray-700 cursor-pointer hover:underline hover:text-blue-600">{item.po_number}</span>
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
const MyInventory = ({sortConfig}) => {
    const [data] = useState(INITIAL_INVENTORY_DATA);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Optimized for card grid layout
    const [searchTerm, setSearchTerm] = useState('');
    //const [sortConfig, setSortConfig] = useState({ key: 'po_date_of_issue', direction: 'descending' });

    // Define sortable columns for the dropdown
    const sortOptions = useMemo(() => [
        { label: 'P.O. Date', key: 'po_date_of_issue' },
        { label: 'Serial Number', key: 'item_serial_number' },
        { label: 'Item Type', key: 'item_type_name' },
        { label: 'Status', key: 'status' },
    ], []);

    /**
     * Memoized hook to handle filtering and sorting the data
     */
    const processedData = useMemo(() => {
        let filteredData = [...data];

        // 1. Filtering Logic
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filteredData = filteredData.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(lowerCaseSearch)
                )
            );
        }

        // 2. Sorting Logic
        filteredData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return filteredData;
    }, [data, searchTerm, sortConfig]);

    // 3. Pagination Logic
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

    const handleSortChange = (e) => {
        const key = e.target.value;
        setSortConfig(prev => ({ 
            key, 
            direction: prev.key === key ? (prev.direction === 'ascending' ? 'descending' : 'ascending') : 'descending' 
        }));
    };

    const handleDirectionToggle = () => {
        setSortConfig(prev => ({ 
            ...prev, 
            direction: prev.direction === 'ascending' ? 'descending' : 'ascending' 
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Reset page to 1 whenever filtering/sorting changes the data set
    useEffect(() => {
        setCurrentPage(1);
    }, [processedData.length]);


    return (
        <div className="p-4 sm:p-6 bg-gray-50 rounded-xl shadow-inner h-full flex flex-col">
            {/* Controls: Search and Sort */}
            {/* <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search all fields (Serial, P.O., Model, etc.)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 flex-shrink-0">Sort By:</label>
                    <select
                        id="sort-by"
                        value={sortConfig.key}
                        onChange={handleSortChange}
                        className="py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        {sortOptions.map(option => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleDirectionToggle}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition duration-150"
                        title={`Change to ${sortConfig.direction === 'ascending' ? 'Descending' : 'Ascending'}`}
                    >
                        {sortConfig.direction === 'ascending' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    </button>
                </div>
            </div> */}

            {/* Card Grid */}
            <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2"> {/* Scrollable area */}
                {paginatedData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {paginatedData.map((item) => (
                            <InventoryCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-lg text-gray-500">No items found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                    Showing <span className="font-semibold text-blue-600">{Math.min(totalItems, startIndex + 1)}</span> to <span className="font-semibold text-blue-600">{Math.min(totalItems, startIndex + itemsPerPage)}</span> of <span className="font-semibold">{totalItems}</span> total items
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
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