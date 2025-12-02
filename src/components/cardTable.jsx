import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import api from "../api/apiCall.js";
import MyGrid from "./NewDataTable.jsx";
import GlobalLoading from "../globalLoading.jsx";
import NoDataAvailable from "../utils/NoDataUi.jsx";

const CardTable = ({ phaseIds, onBackToDashboard, initialData }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTableData, setRefreshTableData] = useState(false);
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

    useEffect(() => {
        setLoading(true);
        api.get(`/api/dashboard/${phaseId}`, { 
            params: { 
                page: currentPage + 1, 
                limit: pageSize, 
                status_id: phaseId, 
                search: searchTerm 
            } 
        })
        .then((response) => {
            const fetchedData = response.data.data;
            setData(fetchedData);
            setTotal(response.data.pagination.total);
            if (fetchedData.length === 0 && !searchTerm) {
                // No data found AND it was not a search operation
                // Navigate back to the dashboard
                onBackToDashboard();
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [currentPage, pageSize, searchTerm, refreshTableData, phaseId]);

    const handleBack = () => {
        onBackToDashboard();
    };

    const title = phases[phaseId] || 'Details';

    console.log('Resetting to Dashboard', loading);
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-100 min-h-[calc(100vh-9.75rem)] transition-all duration-300">
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Dashboard
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search PO NO."
                            className="border border-gray-300 rounded-lg px-4 py-2 pl-10 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                <MyGrid
                    title={title}
                    loading={loading}
                    data={data}
                    total={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    onSearchTermChange={setSearchTerm}
                    refreshData={() => setRefreshTableData(prev => !prev)}
                    isSearching={searchTerm}
                />
            </div>
        </div>
    );
};

export default CardTable;