import { useEffect, useState } from "react";
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

const Home = () => {
    const navigate = useNavigate();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [currentRender, setCurrentRender] = useState(localStorage.getItem('currentRender') || 'Dashboard');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [data, setData] = useState(currentRender === 'Dashboard' ? {} : []);
    const [loading, setLoading] = useState(true);
    const [refreshTableData, setRefreshTableData] = useState(false);
    const addToast = useToast();
    const { isAuthenticated, setIsAuthenticated } = useAuth();



    useEffect(() => {
        localStorage.setItem('currentRender', currentRender);
    }, [currentRender]);

    useEffect(() => {
        setOpenDrawer(false);
        setData(currentRender === 'Dashboard' ? {} : []);
        const thisEndpoint = getEndpoint(currentRender, 'get', 'url', { page: currentPage + 1, limit: pageSize });
        const params = currentRender === 'Dashboard' ? {} : { page: currentPage + 1, limit: pageSize };
        setLoading(true);
        api.get(thisEndpoint, { params })
            .then((response) => {
                if (currentRender === 'Dashboard') {
                    setData(response.data.dashboard);
                } else {
                    setData(response.data.data);
                    setTotal(response.data.pagination.total);
                    setCurrentPage(response.data.pagination.page - 1);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                addToast(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentRender, currentPage, pageSize, refreshTableData]);

    const handlePoForm = () => {
        navigate("/po-inspection/create", { state: { defaultValues: {}, task: "Create Inspection" } });
        setOpenDrawer(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-t from-pink-50 via-white to-blue-50 transform transition-transform duration-300">
            <Header openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
            {currentRender === 'Dashboard' && (<Dashboard apiData={data} loading={loading} />)}
            {openDrawer && (<Drawer open={openDrawer} setOpenDrawer={setOpenDrawer} handlePoForm={handlePoForm} currentRender={currentRender} setCurrentRender={setCurrentRender} />)}
            {currentRender !== 'Dashboard' && (
                loading ?
                    <GlobalLoading /> :
                    (<div className={`flex-1 max-h-[85vh] max-w-[85vw] mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
                        <MyGrid
                            title={currentRender}
                            loading={loading}
                            data={data}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={(page) => setCurrentPage(page)}
                            onPageSizeChange={(pageSize) => setPageSize(pageSize)}
                            total={total} setTotal={setTotal}
                            refreshData={() => setRefreshTableData(prev => !prev)} />
                    </div>)
            )}
        </div>
    );
};
export default Home;