import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./dashboard.jsx";
import MyGrid from "./NewDataTable.jsx";
import getEndpoint from "../utils/endpoints.jsx";
import api from "../api/apiCall.js";
import { useToast } from "../context/toastProvider.jsx";
import PurchaseOrderReportsDashboard from "./certificatesPage.jsx";
import Layout from "./wrapperLayout.jsx";
import { useCurrentRender } from "../context/renderContext.jsx";
import { set } from "react-hook-form";
import RMAPage from "./RMA/rma_home.jsx";
import MyInventory from "./myInventory.jsx";
import { ArrowDown, ArrowUp, Search } from "lucide-react";

// Helper function to return the correct initial state shape
const getInitialData = (render) => (render === 'Dashboard' ? {} : []);

// NEW HELPER: Guarantees the data shape for the current render view
const getDisplayData = (render, apiData) => {
    if (render === 'Dashboard') {
        // Dashboard should always be an object. If apiData is not an object, return an empty object.
        return typeof apiData === 'object' && apiData !== null && !Array.isArray(apiData) ? apiData : {};
    } else {
        // List views (Certificates, etc.) should always be an array. If apiData is not an array, return an empty array.
        return Array.isArray(apiData) ? apiData : [];
    }
};


const Home = () => {
    const navigate = useNavigate();
    const { currentRender, handleSetCurrentRender } = useCurrentRender();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(null);
    const [inputSearch, setInputSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'po_date_of_issue', direction: 'descending' });
    const [data, setData] = useState(getInitialData(currentRender));
    const [loading, setLoading] = useState(false);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const addToast = useToast();

    const sortOptions = useMemo(() => [
        { label: 'P.O. Date', key: 'po_date_of_issue' },
        { label: 'Serial Number', key: 'item_serial_number' },
        { label: 'Item Type', key: 'item_type_name' },
        { label: 'Status', key: 'status' },
    ], []);

    useEffect(() => {
        setData(getInitialData(currentRender));
        setPage(0);
        setLimit(10);
        setSearchTerm(null);
    }, [currentRender]);

    useEffect(() => {
        // Only run for list views that use search
        if (currentRender === 'Dashboard' || currentRender === 'Certificates') return;

        // Set a timer
        const handler = setTimeout(() => {
            const trimmedValue = inputSearch.trim();
            // Only set searchTerm if value is 2+ characters or empty
            if (trimmedValue.length >= 2) {
                setSearchTerm(trimmedValue);
            } else if (trimmedValue.length === 0) {
                setSearchTerm(null); // Clears search when input is empty
            }
            // Note: If 1 character is typed, searchTerm remains its previous value
        }, 1000); // 500ms delay

        // Cleanup function: important to cancel the previous timer
        return () => {
            clearTimeout(handler);
        };
    }, [inputSearch, currentRender]);

    useEffect(() => {
        const isDashboard = currentRender === 'Dashboard';
        if (currentRender === 'RMA') {
            return;
        }
        setLoading(true);

        const thisEndpoint = getEndpoint(currentRender, 'get', 'url', { page: page + 1, limit: limit, search: searchTerm });
        if (!thisEndpoint || typeof thisEndpoint !== 'string' || thisEndpoint.startsWith('Endpoint for')) {
            console.error(`Invalid endpoint generated for: ${currentRender}. Aborting API call.`);
            setLoading(false);
            // Optionally show a toast error here
            return;
        }
        const params = isDashboard ? {} : { page: page + 1, limit: limit, search: searchTerm };

        api.get(thisEndpoint, { params })
            .then(response => {
                if (isDashboard) {
                    setData(response.data || {});
                } else {
                    setData(response.data.data || []);
                    setTotal(response.data.pagination.total);
                    setLimit(response.data.pagination.limit);
                    setTotalPages(response.data.pagination.totalPages);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                addToast(error);
                // On error, reset data to an empty value of the expected type
                setData(isDashboard ? {} : []);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [currentRender, page, limit, searchTerm, refreshTableData]);

    useEffect(() => {
        if (currentRender === 'Inventory') {
            let filterData = [...data];
            filterData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            })
        }
    }, [sortConfig])

    // Handler to set currentRender and reset pagination
    const handleSetCurrentRenderLocal = (newRender) => {
        handleSetCurrentRender(newRender);
        if (newRender !== 'Dashboard') {
            setPage(0);
            setLimit(10);
        }
    };

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setInputSearch(value);
        // Do not update setSearchTerm directly here. The debounce effect will handle it.
    }, []);

    let mainContent;
    if (currentRender === 'Dashboard') {
        mainContent = (
            <Dashboard
                apiData={getDisplayData('Dashboard', data)}
                loading={loading}
                refresh={() => setRefreshTableData(prev => !prev)}
            />
        );
    } else if (currentRender === 'Certificates') {
        mainContent = (
            <PurchaseOrderReportsDashboard
                data={getDisplayData('Certificates', data)}
                pagination={{ page: page + 1, limit, total, totalPages }}
            />
        );
    } else if (currentRender === 'RMA') {
        mainContent = (
            <RMAPage />
        );
    } else if (currentRender === 'Inventory') {
        mainContent = (
            <MyInventory 
            sortConfig={sortConfig}/>
        );
    } else {
        // Handles 'All POs', 'Type', 'Make', 'Model', 'Part', 'Firm', 'Stores', 'Users'
        mainContent = (
            <MyGrid
                title={currentRender}
                loading={loading}
                data={getDisplayData(currentRender, data)}
                currentPage={page}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={setLimit}
                total={total}
                onSearchTermChange={setSearchTerm}
                refreshData={() => setRefreshTableData(prev => !prev)}
            />
        );
    }

    const actionContent = (currentRender !== 'Dashboard' && currentRender !== 'Certificates' && currentRender !== 'RMA' && currentRender !== 'Inventory') ? (
        <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                key="search-input"
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-300 rounded-lg pr-4 py-2 pl-10 max-w-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                onChange={handleInputChange}
                value={inputSearch}
                disabled={loading}
            />
        </div>
    ) : currentRender === 'Inventory' ? (
        <>
            {/* Sort Controls */}
            <div className="flex items-center space-x-2 w-full md:w-auto ml-auto">
                <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 flex-shrink-0">Sort By:</label>
                <select
                    id="sort-by"
                    className="py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={sortConfig.key}
                    onChange={(e) => setSortConfig({ key: e.target.value, direction: sortConfig.direction })}
                >
                    {sortOptions.map(option => (
                        <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                </select>

                <button
                    className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition duration-150"
                    title={`Change to ${sortConfig.direction === 'ascending' ? 'Descending' : 'Ascending'}`}
                    onClick={() => setSortConfig({ key: sortConfig.key, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending' })}
                >
                    {sortConfig.direction === 'ascending' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </button>
            </div>
            {/* Search Bar */}
            <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search all fields (Serial, P.O., Model, etc.)"
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                />
            </div>
        </>
    )
        : null;

    return (
        <Layout
            subTitle={currentRender}
            setCurrentRender={handleSetCurrentRenderLocal} // Pass the handler that manages history and state
            loading={loading}
            action={actionContent}
            refreshData={() => setRefreshTableData(prev => !prev)}
        >
            {mainContent}
        </Layout>
    );
};
export default Home;