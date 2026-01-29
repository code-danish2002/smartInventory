import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import MyTable from "./NewDataTable.jsx";
import getEndpoint from "../utils/endpoints.jsx";
import api from "../api/apiCall.js";
import { Search } from "lucide-react";
import NoDataAvailable from "../utils/NoDataUi.jsx";
import { AddSquare } from "../utils/icons.jsx";
import ParentModal from "../modals/parentModal.jsx";

const MasterDataView = () => {
    const { type } = useParams();
    const title = type.charAt(0).toUpperCase() + type.slice(1);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputSearch, setInputSearch] = useState('');
    const [openModal, setOpenModal] = useState(false);

    // Reset on type change
    useEffect(() => {
        setPage(0);
        setLimit(10);
        setSearchTerm('');
        setInputSearch('');
    }, [type]);

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmed = inputSearch.trim();
            if (trimmed.length >= 2 || trimmed.length === 0) {
                setSearchTerm(trimmed);
                setPage(0);
            }
        }, 800);
        return () => clearTimeout(handler);
    }, [inputSearch]);

    const { data: queryResponse, isLoading, error, refetch } = useQuery({
        queryKey: [title, page, limit, searchTerm],
        queryFn: async () => {
            const endpoint = getEndpoint(title, 'get', 'url', { page: page + 1, limit, search: searchTerm });
            const response = await api.get(endpoint, { params: { page: page + 1, limit, search: searchTerm || undefined } });
            return response.data;
        },
        keepPreviousData: true,
    });

    const data = queryResponse?.data || [];
    const total = queryResponse?.pagination?.total || 0;

    const handleInputChange = useCallback((e) => setInputSearch(e.target.value), []);

    if (error) return <NoDataAvailable title={'Data Fetch Error'} explanation={error.message} />;

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex items-center justify-between gap-2 flex-shrink-0 mb-4">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search in table..."
                        className="w-full border border-gray-300 rounded-lg pr-4 py-2 pl-10 max-w-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                        onChange={handleInputChange}
                        value={inputSearch}
                        disabled={isLoading}
                    />
                </div>
                {['Make', 'Model', 'Part', 'Stores'].includes(title) && (
                    <button
                        onClick={() => setOpenModal(true)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-md"
                    >
                        <AddSquare className="h-5 w-5" /> {title}
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-auto min-h-0">
                <MyTable
                    title={title}
                    loading={isLoading}
                    data={data}
                    currentPage={page}
                    pageSize={limit}
                    onPageChange={setPage}
                    onPageSizeChange={setLimit}
                    total={total}
                    refreshData={refetch}
                />
            </div>
            {openModal && (
                <ParentModal
                    modalName={title}
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    type='create'
                    onAction={refetch}
                />
            )}
        </div>
    );
};

export default MasterDataView;
