import { useState, useEffect, useMemo } from "react";
import api from "../api/apiCall.js";
import MyGrid from "../components/NewDataTable.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import GlobalLoading from "../globalLoading.jsx";
import Layout from "../components/wrapperLayout.jsx";
import { useCurrentRender } from "../context/renderContext.jsx";
import NoDataAvailable from "../utils/NoDataUi.jsx";

export const ShowDetails = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);

    const { handleSetCurrentRender } = useCurrentRender();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { phaseId, deviceName } = state || {};

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
        handleSetCurrentRender(phases[phaseId] || 'Details');
    }, [phaseId, handleSetCurrentRender, phases]);

    // useEffect(() => {
    //     if (!state) {
    //         // no state ⇒ go back (or fetch from API using some default)
    //         navigate(-1);
    //     }
    // }, [state, navigate]);

    useEffect(() => {
        api.get(`/api/dashboard/${phaseId}`, { params: { page: currentPage + 1, limit: pageSize, status_id: phaseId, search: searchTerm } })
            .then((response) => {
                setData(response.data.data);
                setTotal(response.data.pagination.total);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentPage, pageSize, searchTerm, refreshTableData, phaseId]);
    if(searchTerm?.length >1 && data.length ===0 && !loading){
        return(
            <Layout
                subTitle={phases[phaseId]}
                loading={loading}
                action={
                    <input
                        type="text"
                        placeholder="Search PO NO."
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs"
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value.trim();
                            if (value.length >= 2) {
                                setSearchTerm(value);
                            } else {
                                setSearchTerm(null);
                            }
                        }}
                        disabled={loading}
                    />
                }
            ><NoDataAvailable /></Layout>
        )
    }
    if (searchTerm?.length === 0 && data?.length === 0 && !loading) {
        console.log('Resetting to Dashboard');
        handleSetCurrentRender('Dashboard');
    }
    
    return (
        <Layout
            subTitle={phases[phaseId]}
            loading={loading}
            action={
                <input
                    type="text"
                    placeholder="Search PO NO."
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs"
                    value={searchTerm}
                    onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value.length >= 2) {
                            setSearchTerm(value);
                        } else {
                            setSearchTerm(null);
                        }
                    }}
                    disabled={loading}
                />
            }
        >
            <MyGrid
                title={phases[phaseId]}
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
        </Layout>
    );
};