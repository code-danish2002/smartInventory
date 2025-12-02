import React, { useState, useMemo } from 'react';
// Import Radix Dialog components
import * as Dialog from '@radix-ui/react-dialog';
// Import icons from Lucide
import { ExternalLink, LoaderCircle, X } from 'lucide-react';

// --- 1. MOCK DATA (Remains the same) ---
const mockResponse = {
    "success": true,
    "data": [
        { "po_id": 302, "po_number": "1002410064", "po_date_of_issue": "2024-05-02T11:56:00+05:30", "po_created_at": "2025-10-03T17:30:02+05:30", "user_pdf_phases": "Site", "pdf": "https://s3.selfservice.cnoc.rcil.gov.in/rcil/site_reports/2025/10/09/1760000020478_Site_Receive_Report_1002410064_ALL_SITES_1_items.pdf?..." },
        { "po_id": 302, "po_number": "1002410064", "po_date_of_issue": "2024-05-02T11:56:00+05:30", "po_created_at": "2025-10-03T17:30:02+05:30", "user_pdf_phases": "Dispatch", "pdf": "https://s3.selfservice.cnoc.rcil.gov.in/rcil/dispatch_reports/2025/10/09/1759999998055_Dispatch_Report_1002410064.pdf?..." },
        { "po_id": 302, "po_number": "1002410064", "po_date_of_issue": "2024-05-02T11:56:00+05:30", "po_created_at": "2025-10-03T17:30:02+05:30", "user_pdf_phases": "Store", "pdf": "https://s3.selfservice.cnoc.rcil.gov.in/rcil/store_reports/2025/10/09/1759999899499_Store_Receive_Report_FLM282208JN.pdf?..." },
        // ... (rest of mock data remains the same) ...
    ],
    "pagination": { "page": 1, "limit": 10, "total": 14, "totalPages": 2 }
};

// --- 2. DATA PROCESSING AND HELPER FUNCTIONS (Remain the same) ---

const groupDataByPO = (rawData) => {
    const poMap = new Map();
    rawData.forEach(item => {
        const poNumber = item.po_number;
        if (!poMap.has(poNumber)) {
            poMap.set(poNumber, {
                po_number: poNumber,
                po_id: item.po_id,
                po_date_of_issue: item.po_date_of_issue,
                po_created_at: item.po_created_at,
                reports: [],
                report_phases: new Set(),
            });
        }
        const poEntry = poMap.get(poNumber);
        poEntry.reports.push(item);
        poEntry.report_phases.add(item.user_pdf_phases);
    });
    return Array.from(poMap.values());
};

const groupReportsByPhase = (reports) => {
    return reports.reduce((acc, report) => {
        const phase = report.user_pdf_phases;
        if (!acc[phase]) {
            acc[phase] = [];
        }
        acc[phase].push(report);
        return acc;
    }, {});
};

const formatDate = (isoString) => {
    try {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
};

/**
 * Gets the Tailwind color classes for a given phase tag.
 */
const getPhaseColor = (phase) => {
    switch (phase.toLowerCase()) {
        case 'site': return { bg: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200', sectionBg: 'bg-green-50', linkColor: 'text-teal-500' };
        case 'dispatch': return { bg: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', sectionBg: 'bg-blue-50', linkColor: 'text-teal-500' };
        case 'store': return { bg: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200', sectionBg: 'bg-purple-50', linkColor: 'text-teal-500' };
        default: return { bg: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200', sectionBg: 'bg-gray-50', linkColor: 'text-teal-500' };
    }
};

const getFileName = (url, fallbackIndex) => {
    try {
        const parts = url.split('/');
        const filenameWithParams = parts[parts.length - 1];
        const filename = filenameWithParams.split('?')[0];
        const relevantPart = filename.split('_')[3];
        return relevantPart ? relevantPart.replace('.pdf', '') : filename;
    } catch (e) {
        return `Report ${fallbackIndex + 1}`;
    }
};

// --- 3. COMPONENTS ---

/**
 * Component for the detail view modal (using Radix UI Dialog).
 */
const ReportModal = ({ isOpen, onClose, poData }) => {
    if (!poData) return null;

    const groupedReports = groupReportsByPhase(poData.reports);
    const phaseOrder = ['Site', 'Dispatch', 'Store'];

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            {/* The Trigger button is handled in the main component */}
            <Dialog.Portal>
                {/* ModalOverlay equivalent - Radix Dialog Overlay */}
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
                
                {/* ModalContent equivalent - Radix Dialog Content */}
                <Dialog.Content 
                    className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] 
                               rounded-xl bg-white p-6 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] 
                               focus:outline-none data-[state=open]:animate-contentShow overflow-y-auto"
                >
                    {/* ModalHeader equivalent - Radix Dialog Title */}
                    <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900 border-b border-gray-200 pb-3 relative">
                        PDF Documents for PO: {poData.po_number}
                    </Dialog.Title>

                    {/* ModalBody equivalent */}
                    <div className="mt-6">
                        {/* VStack equivalent */}
                        <div className="space-y-6">
                            {
                                Object.keys(groupedReports)
                                    .sort((a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b))
                                    .map((phase) => {
                                        const reportList = groupedReports[phase];
                                        const { sectionBg, linkColor } = getPhaseColor(phase);

                                        return (
                                            <div
                                                key={phase}
                                                className={`p-4 border border-gray-200 rounded-lg shadow-md ${sectionBg}`}
                                            >
                                                {/* HStack equivalent */}
                                                <div className="flex items-center mb-3">
                                                    {/* Tag equivalent */}
                                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${getPhaseColor(phase).bg}`}>
                                                        {phase} Reports
                                                    </span>
                                                    <p className="ml-3 text-sm text-gray-600">
                                                        ({reportList.length} files)
                                                    </p>
                                                </div>
                                                {/* SimpleGrid equivalent */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {reportList.map((report, index) => (
                                                        <a
                                                            key={index}
                                                            href={report.pdf}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-200 transition duration-150 ease-in-out hover:shadow-lg hover:border-teal-400 hover:translate-y-[-2px]`}
                                                        >
                                                            <p className="text-sm font-medium truncate mr-2 text-gray-800">
                                                                {getFileName(report.pdf, index)}
                                                            </p>
                                                            <ExternalLink className={`w-4 h-4 ${linkColor}`} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                            }
                        </div>
                    </div>
                    
                    {/* ModalCloseButton equivalent - Radix Dialog Close */}
                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:shadow-[0_0_0_2px] focus:shadow-teal-500 rounded-full"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

/**
 * Component for the main report table display.
 */
const CertificatesPage = () => {
    const [selectedPO, setSelectedPO] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // Manually handle modal state
    const [isLoading, setIsLoading] = useState(false); // Simulated loading state

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const groupedData = useMemo(() => {
        if (!mockResponse.success || mockResponse.data.length === 0) return [];
        return groupDataByPO(mockResponse.data);
    }, []);

    const handleOpenModal = (po) => {
        setSelectedPO(po);
        onOpen();
    };

    if (isLoading) {
        return (
            // Flex & Spinner equivalent
            <div className="flex h-screen items-center justify-center">
                <LoaderCircle className="w-12 h-12 text-teal-600 animate-spin" />
                <p className="ml-4 text-gray-700">Loading Data...</p>
            </div>
        );
    }

    // Fallback for no data
    if (groupedData.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-8 text-center">
                <h1 className="text-2xl font-semibold text-gray-700 mb-4">PO Report Tracking</h1>
                <div className="p-6 bg-white shadow-md rounded-xl">
                    <p className="text-lg text-gray-500">
                        No purchase order data is currently available.
                    </p>
                </div>
            </div>
        );
    }

    return (
        // Box equivalent with responsive padding and background
        <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
            {/* Header */}
            <div className="mb-8 border-b-2 border-gray-200 pb-2">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    PO Report Tracking
                </h1>
                <p className="text-gray-500">
                    Overview of Purchase Order documents grouped by PO Number.
                </p>
            </div>
            
            {/* Main Content Card */}
            <div
                className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200"
            >
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">Available Purchase Orders</h2>
                </div>

                {/* TableContainer equivalent */}
                <div className="overflow-x-auto">
                    {/* Table equivalent */}
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Thead equivalent */}
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Phases</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        {/* Tbody equivalent */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groupedData.map((po) => {
                                const phasesArray = Array.from(po.report_phases);
                                return (
                                    <tr
                                        key={po.po_number}
                                        className="transition duration-150 ease-in-out hover:bg-blue-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{po.po_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{po.po_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(po.po_date_of_issue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(po.po_created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Tag equivalent */}
                                            <div className="flex flex-wrap gap-1">
                                                {phasesArray.map((phase) => (
                                                    <span
                                                        key={phase}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPhaseColor(phase).bg}`}
                                                    >
                                                        {phase}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-teal-600">{po.reports.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Button equivalent */}
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg shadow-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
                                                onClick={() => handleOpenModal(po)}
                                            >
                                                View Reports
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
                    <p>
                        Showing {groupedData.length} unique POs (Total reports: {mockResponse.pagination.total}) on page {mockResponse.pagination.page} of {mockResponse.pagination.totalPages}.
                    </p>
                </div>
            </div>

            <ReportModal
                isOpen={isOpen}
                onClose={onClose}
                poData={selectedPO}
            />
        </div>
    );
};

export default CertificatesPage;