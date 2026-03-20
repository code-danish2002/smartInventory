import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import api from "../api/apiCall.js";
import MyTable from "./NewDataTable.jsx";
import GlobalLoading from "../globalLoading.jsx";
import NoDataAvailable from "../utils/NoDataUi.jsx";
import { useQueryClient } from '@tanstack/react-query';
import { useCardTableData } from "../hooks/useItemQueries.js";

const CardTable = ({ phaseIds, onBackToDashboard, initialData }) => {
    const queryClient = useQueryClient();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState(null);

    // Flatten phaseIds if it's an array from the dashboard
    const phaseId = useMemo(() => {
        if (Array.isArray(phaseIds)) return phaseIds[0];
        return phaseIds;
    }, [phaseIds]);

    const phases = useMemo(() => ({
        0: "My Activities",
        1: "Item Requests",
        2: "Upload PDF",
        3: "PO Re-Fills",
        4: "Approve PO",
        7: "At Store",
        8: "At Store",
        9: "On Site",
        10: "On Site",
        11: "On Site",
        12: "OEM Spare",
        13: "OEM Spare",
        15: "Live",
    }), []);

    const { data: tableData, isLoading, error, isFetching, refetch } = useCardTableData(phaseId, {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
    });

    useEffect(() => {
        // Only redirect if:
        // - We finished loading (!isLoading)
        // - There is actually data returned (tableData)
        // - The data array is empty (length === 0)
        // - User is NOT searching
        if (!isLoading && !isFetching && tableData && tableData.data.length === 0 && !searchTerm) {
            onBackToDashboard();
        }
    }, [tableData, isLoading, isFetching, searchTerm, onBackToDashboard]);

    const handleBack = () => {
        onBackToDashboard();
    };

    const title = phases[phaseId] || 'Details';

    if (error && !isLoading) return <NoDataAvailable title={error?.message || 'Data Fetch Error'} explanation={'Unable to connect to the server. Please check your connection and try again later.'} />;

    return (
        <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900/50 transition-all duration-300">
            <div className="mb-6 flex-shrink-0">
                <button
                    onClick={handleBack}
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{title}</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search PO NO."
                            className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 pl-10 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value.length >= 2) {
                                    setSearchTerm(value);
                                } else {
                                    setSearchTerm(null);
                                }
                            }}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 min-h-0">
                <MyTable
                    title={title}
                    loading={isLoading}
                    data={tableData?.data || []}
                    total={tableData?.pagination?.total || 0}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    onSearchTermChange={setSearchTerm}
                    refreshData={refetch}
                    isSearching={searchTerm}
                />
            </div>
        </div>
    );
};

export default CardTable;