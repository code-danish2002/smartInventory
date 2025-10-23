import { useState, useEffect } from "react";
import api from "../api/apiCall.js";
import MyGrid from "./NewDataTable.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./header.jsx";
import GlobalLoading from "../globalLoading.jsx";

export const ShowDetails = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);

    const navigate = useNavigate();
    const { state } = useLocation();
    const { phaseId, deviceName } = state || {};

    const phases = {
        0: "My Activities",
        1 : "Upload PDF",
        2 : "PO Re-Fills",
        3 : "Inspection",
        4 : "Inspection",
        7 : "At Store",
        8 : "At Store",
        9 : "OEM Spare",
        10: "On Site",
        11: "On Site",
        12: "OEM Spare",
        13: "Item Requests",
        14: "Live",
    }

    useEffect(() => {
    if (!state) {
      // no state ⇒ go back (or fetch from API using some default)
      navigate(-1);
    }
  }, [state, navigate]);

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
    }, [currentPage, pageSize, searchTerm, refreshTableData]);
    if (loading) {
        <GlobalLoading />
    }
    return (
        <div className="flex flex-col h-screen">
            {/* <Header openDrawer={false} setOpenDrawer={() => {}} /> */}
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
        />
        </div>
    );
};