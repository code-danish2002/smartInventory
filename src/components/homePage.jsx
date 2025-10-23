import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header.jsx";
import Drawer from "./drawer.jsx";
import Dashboard from "./dashboard.jsx";
import MyGrid from "./NewDataTable.jsx";
import getEndpoint from "../utils/endpoints.jsx";
import api from "../api/apiCall.js";
import { useToast } from "../context/toastProvider.jsx";
import { useAuth } from "../context/authContext.jsx";
import GlobalLoading from "../globalLoading.jsx";
import PurchaseOrderReportsDashboard from "./certificatesPage.jsx";

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
    const [openDrawer, setOpenDrawer] = useState(false);

    // Use an initializer function for currentRender
    const [currentRender, setCurrentRender] = useState(() => localStorage.getItem('currentRender') || 'Dashboard');

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(null);
    console.log('Page:', page, 'Limit:', limit, 'Total:', total, 'TotalPages:', totalPages, 'searchTerm:', searchTerm);
    // Initialize data based on the initial currentRender
    const [data, setData] = useState(getInitialData(currentRender)); // This holds the raw data from the API

    const [loading, setLoading] = useState(true);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const addToast = useToast();
    const { isAuthenticated, setIsAuthenticated } = useAuth();

    // Effect to persist currentRender in localStorage
    useEffect(() => {
        localStorage.setItem('currentRender', currentRender);
        //reset everything else when currentRender changes
        setPage(0);
        setLimit(10);
        setSearchTerm(null);
    }, [currentRender]);

    useEffect(() => {
        const handlePopState = () => {
            // When user hits back button, reset to Dashboard
            setCurrentRender('Dashboard');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);
    useEffect(() => {
        const isDashboard = currentRender === 'Dashboard';
        setLoading(true);
        setOpenDrawer(false);

        // Ensure phaseId is defined if the endpoint needs it, etc.
        const thisEndpoint = getEndpoint(currentRender, 'get', 'url', { page: page + 1, limit: limit, search: searchTerm });
        const params = isDashboard ? {} : { page: page + 1, limit: limit, search: searchTerm }; // Ensure 'search' is in params for list views

        api.get(thisEndpoint, { params })
            .then(response => {
                if (isDashboard) {
                    setData(response.data.dashboard || {});
                } else {
                    setData(response.data.data || []);
                    setTotal(response.data.pagination.total);
                    // setPage(response.data.pagination.page - 1); // REMOVE THIS LINE
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

    }, [currentRender, page, searchTerm, refreshTableData]);

    // Handler to set currentRender and reset pagination
    const handleSetCurrentRender = (newRender) => {
        if (newRender === currentRender) return;

        if (newRender === 'Dashboard') {
            // Go back to Dashboard: we don't push state, just update
            setCurrentRender('Dashboard');
            // Optional: replace current history state to clean stack
            window.history.replaceState(null, '', window.location.href);
        } else {
            // Switching to a non-Dashboard view: push new history state
            setCurrentRender(newRender);
            // Push a fake state so back button works
            window.history.pushState({ currentRender: newRender }, '', window.location.href);
        }

        // Reset pagination for list views
        if (newRender !== 'Dashboard') {
            setPage(0);
            setLimit(10);
        }
    };

    const handlePoForm = () => {
        navigate("/po-inspection/create", { state: { defaultValues: {}, task: "Create Inspection" } });
        setOpenDrawer(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-t from-pink-50 via-white to-blue-50 transform transition-transform duration-300">
            <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
            {openDrawer && (
                <Drawer
                    open={openDrawer}
                    setOpenDrawer={setOpenDrawer}
                    handlePoForm={handlePoForm}
                    currentRender={currentRender}
                    setCurrentRender={handleSetCurrentRender}
                />
            )}
            {currentRender === 'Dashboard' ? (
                <Dashboard
                    apiData={getDisplayData('Dashboard', data)}
                    loading={loading}
                />
            ) : currentRender === 'Certificates' ? (
                loading ? <GlobalLoading /> :
                    <PurchaseOrderReportsDashboard
                        data={getDisplayData('Certificates', data)} // **THIS IS THE CRITICAL CHANGE**
                        pagination={{ page: page + 1, limit, total, totalPages }}
                    />
            ) : (
                <div className={`flex-1 max-h-[85vh] max-w-[85vw] mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
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
                </div>
            )}
        </div>
    );
};
export default Home;