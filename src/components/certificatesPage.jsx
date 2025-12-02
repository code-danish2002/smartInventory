// src/components/certificatesPage.jsx
import { useState } from 'react';
import api from '../api/apiCall';

// Helper Functions
const formatDate = (isoString) => {
    try {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    } catch (e) {
        return 'N/A';
    }
};

const getPhaseColor = (phase) => {
    switch (phase.toLowerCase()) {
        case 'site': return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'dispatch': return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case 'store': return { bg: 'bg-purple-100', text: 'text-purple-800' };
        case 'upload': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

const Pagination = ({ pagination, onPageChange }) => {
    const { page, totalPages, total } = pagination;
    const limit = 8; // Fixed limit as per requirement

    if (totalPages <= 1) return null;

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);
    
    // Logic to display a reasonable number of page buttons (max 5)
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const PageButton = ({ p, current }) => (
        <button
            onClick={() => onPageChange(p)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border transition duration-150 ease-in-out ${
                current ? 'bg-teal-600 text-white border-teal-600 shadow-md z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-current={current ? 'page' : undefined}
            aria-label={`Go to page ${p}`}
        >
            {p}
        </button>
    );

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            {/* Mobile View */}
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            
            {/* Desktop View */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Previous Button */}
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Page Numbers */}
                        {pageNumbers.map(p => (
                            <PageButton key={p} p={p} current={p === page} />
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

const ReportTable = ({ data=[], pagination }) => {
    if (Array.isArray(data) && data.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                No report data found.
            </div>
        );
    }

    const colWidths = [
        'w-1/5', // PO Number (Increased width)
        'w-1/4', // Issue Date (Increased width)
        'w-1/4', // Created Date (Increased width)
        'w-1/5', // Available Phases (Decreased width)
        'w-[100px]' // Action (Fixed smaller width)
    ];

    return (
        // Set a min-width to ensure the table content doesn't shrink too much
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                
                {/* Table Header */}
                <thead>
                    <tr className="bg-gray-100">
                        {/* PO Number */}
                        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tl-xl ${colWidths[0]}`}>PO Number</th>
                        {/* PO ID REMOVED */}
                        {/* Issue Date */}
                        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${colWidths[1]}`}>Issue Date</th>
                        {/* Created Date */}
                        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${colWidths[2]}`}>Created Date</th>
                        {/* Available Phases */}
                        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${colWidths[3]}`}>Available Phases</th>
                        {/* Action */}
                        <th className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider rounded-tr-xl ${colWidths[4]}`}>Action</th>
                    </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200">
                    {data?.map(po => (
                        // PO ID column will be excluded in TableRow as well
                        <TableRow key={po.po_number} po={po} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TableRow = ({ po }) => {
    const phaseTags = po?.aggregates?.map(phase => {
        const colors = getPhaseColor(phase);
        return (
            <span
                key={phase}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mr-1 mb-1 shadow-sm`}
            >
                {phase}
            </span>
        );
    });

    return (
        <tr className="hover:bg-gray-50 transition duration-150 ease-in-out">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.po_number}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(po.po_date_of_issue)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(po.po_created_at)}</td>
            <td className="px-6 py-4">{phaseTags}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <ViewReportsButton poId={po.po_id} poNumber={po.po_number} reportCount={po.count} />
            </td>
        </tr>
    );
};

const ViewReportsButton = ({ poId, poNumber, reportCount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reports, setReports] = useState([]); // State to hold fetched reports
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/po-pdfs/${poNumber}`);
            setReports(response.data.data);
        } catch (error) {
            setReports([]);
            setError(error);
        } finally {
            setIsLoading(false);
            setIsModalOpen(true);
        }
    }
    return (
        <>
            <button
                onClick={() => fetchReports()}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
            >
                {isLoading ? 'Loading...' : `View ${reportCount} Reports`}
            </button>
            {isModalOpen && (
                <ReportModal
                    reports={reports}
                    poNumber={poNumber}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

const ReportModal = ({ reports, poNumber, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative bg-white w-full max-w-4xl p-6 rounded-xl shadow-2xl mx-4 animate-slide-down">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-2xl font-semibold"
                    aria-label="Close"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                    PDF Documents for PO: {poNumber}
                </h3>
                <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
                    {Object.entries(reports).map(([phase, reportList]) => (
                        Array.isArray(reportList) && reportList.length > 0 && (
                            <PhaseSection key={phase} phase={phase} reports={reportList} />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

const PhaseSection = ({ phase, reports }) => {
    const colors = getPhaseColor(phase);
    const links = reports.map((report, index) => {
        const filename = report.pdf.split('/').pop().split('?')[0].split('_')[3] || `Report ${index + 1}`;
        return (
            <a
                key={index}
                href={report.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-teal-400 transition duration-150 ease-in-out text-left"
            >
                <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">{filename}</span>
                    <svg className="w-4 h-4 text-teal-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-2h8m0 0l-3-3m3 3l-3 3"></path>
                    </svg>
                </div>
                <span className="mt-1 text-xs text-gray-500">
                    Created: {formatDate(report.pdf_created_at)}
                </span>
            </a>
        );
    });

    return (
        <div className="p-4 rounded-xl border border-gray-100 shadow-lg">
            <div className="flex items-center mb-3">
                <span className={`text-lg font-semibold px-3 py-1 rounded-full ${colors.bg} ${colors.text} shadow-sm`}>
                    {phase} Reports
                </span>
                <span className="ml-3 text-sm text-gray-500">({reports.length} files)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links}
            </div>
        </div>
    );
};

const PurchaseOrderReportsDashboard = ({ data, pagination, onPageChange }) => {
    return (
        <div className="p-4 sm:p-2">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h3 className="font-bold text-gray-500 border-b-2">Overview of Purchase Order documents.</h3>
                </header>

                {/* Main Content */}
                <div className="bg-transparent shadow-xl rounded-xl overflow-hidden">
                    <div className="p-4 sm:px-6 sm:py-4 bg-gray-50 border-b rounded-xl">
                        <h2 className="text-xl font-semibold text-gray-700">Available Certificates</h2>
                    </div>
                    <ReportTable data={data} pagination={pagination} />
                    <Pagination pagination={pagination} onPageChange={onPageChange}/>
                </div>
            </div>

            {/* Global Styles */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f7f9fb;
        }
        @keyframes slide-down {
          0% { transform: translateY(-50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default PurchaseOrderReportsDashboard;