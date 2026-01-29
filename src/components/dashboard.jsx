import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
    FaClipboardList,
    FaFileUpload,
    FaSearch,
    FaStore,
    FaTruckLoading,
    FaTools,
    FaChartLine,
    FaRegLightbulb
} from 'react-icons/fa';

import { DraftOrders } from '../utils/icons';
import NoDataAvailable from '../utils/NoDataUi';
import CardTable from './cardTable';
import { useCurrentRender } from '../context/renderContext';
import { ContentLoading } from '../globalLoading';
import api from '../api/apiCall';
import { Bell } from 'lucide-react';

// ----------------- Static Mappings -----------------
const phases = {
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
};

const information = {
    0: "POs you worked on",
    1: "Upload PDF to POs",
    2: "POs that need correction",
    3: "POs sent to you for Correction",
    4: "POs sent to you for Approval",
    7: "Items that are at the store",
    8: "Items that are at the store",
    9: "Items that are at the OEM Spare",
    10: "Items that are at the site",
    11: "Items that are at the site",
    12: "Items that are at the OEM Spare",
    13: "Add Item(s) for requested POs",
    15: "Items that are live in the inventory",
};

const getIconComponent = (phase) => {
    switch (phase) {
        case "My Activities": return DraftOrders;
        case "PO Re-Fills": return FaClipboardList;
        case "Upload PDF": return FaFileUpload;
        case "Approve PO": return FaSearch;
        case "At Store": return FaStore;
        case "On Site": return FaTruckLoading;
        case "OEM Spare": return FaTools;
        case "Item Requests": return FaRegLightbulb;
        case "Live": return FaChartLine;
        default: return FaClipboardList;
    }
};

// ----------------- Card Component -----------------
const DashboardCard = ({ title, subtitle, count, unreadCount, icon: IconComponent, cardClick }) => {
    const isActive = count > 0;

    return (
        <div
            onClick={cardClick}
            className={`p-6 rounded-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${isActive
                ? 'bg-white shadow-xl border-t-4 border-indigo-600 cursor-pointer'
                : 'bg-white shadow-md border-t-4 border-gray-200'
                }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {title}
                    </h3>
                    <p className={`text-4xl font-extrabold mt-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {count}
                    </p>
                </div>

                <span className={`p-3 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <IconComponent size={24} />
                </span>
            </div>
            <div className="flex items-center justify-between mt-4 border-t pt-3">
                <p className="text-xs text-gray-500">
                    {subtitle}
                </p>
                {unreadCount > 0 && <Bell size={20} className="text-amber-500 animate-bell" />}
            </div>
        </div>
    );
};

// ----------------- Main Dashboard -----------------
const Dashboard = () => {
    const { handleSetCurrentRender } = useCurrentRender();
    const queryClient = useQueryClient();
    const [refresh, setRefresh] = React.useState(false);

    // Normalized states: { [status_id]: value }
    const [counts, setCounts] = React.useState({});
    const [unreadCounts, setUnreadCounts] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    const [currentView, setCurrentView] = React.useState('dashboard');
    const [selectedPhaseIds, setSelectedPhaseIds] = React.useState(null);

    // ----------------- WebSocket Connection -----------------
    React.useEffect(() => {
        let ws = null;
        let shouldReconnect = true;
        let reconnectTimeout = null;

        const connect = async () => {
            const token = sessionStorage.getItem("auth_token");

            if (!token) {
                setLoading(false);
                return;
            }

            ws = new WebSocket(`${import.meta.env.VITE_API_WS_URL}/ws/dashboard`, ['access-token', token]);

            ws.onopen = () => {
                console.log("✅ WebSocket Connected");
            };

            ws.onmessage = (e) => {
                const msg = JSON.parse(e.data);

                if (msg.type === "AUTH_ERROR") {
                    handleAuthFailure();
                    return;
                }

                if (msg.type === "DASHBOARD_DATA") {
                    const newCounts = {};
                    const newUnreads = {};
                    msg.dashboard.forEach(item => {
                        newCounts[item.status_id] = item.total_count;
                        newUnreads[item.status_id] = item.unread_count;
                    });
                    setCounts(newCounts);
                    setUnreadCounts(newUnreads);
                    setLoading(false);
                }
                if (msg.type === "DASHBOARD_UPDATE_DATA") {
                    const countUpdate = {};
                    const unreadUpdate = {};
                    msg.dashboard.forEach(item => {
                        countUpdate[item.status_id] = item.total_count;
                        unreadUpdate[item.status_id] = item.unread_count;
                    });
                    setCounts(countUpdate);
                    setUnreadCounts(unreadUpdate);
                    setLoading(false);

                    // Real-time Cache Invalidation
                    queryClient.invalidateQueries();
                    console.log("🔄 Global Cache Invalidated via WebSocket");
                }
            };

            ws.onclose = (event) => {
                if (shouldReconnect) {
                    if (event.code === 1008 || event.code === 3000) {
                        handleAuthFailure();
                    } else {
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket Error:", err);
            };
        };

        const handleAuthFailure = async () => {
            console.warn("⚠️ Auth failure detected. Refreshing...");
            if (ws) ws.close();

            try {
                await api.get('/api/auth/ping');
                console.log("🔄 Token refreshed. Reconnecting...");
                if (shouldReconnect) connect();
            } catch (err) {
                console.error("❌ Refresh Token expired. Redirecting to login.");
            }
            finally {
                setLoading(false);
            }
        };

        connect();

        return () => {
            shouldReconnect = false;
            if (ws) ws.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [queryClient]);

    if (loading) {
        return <ContentLoading />;
    }

    if (!counts || Object.keys(counts).length === 0) {
        return (
            <NoDataAvailable
                title="No Dashboard Data"
                explanation="Unable to retrieve data from the server. Please check your connection."
            />
        );
    }

    const aggregatedData = {};

    Object.entries(counts).forEach(([id, count]) => {
        const statusId = parseInt(id);
        const title = phases[statusId];
        const subtitle = information[statusId];
        const unread = unreadCounts[statusId] || 0;

        if (!title) return;

        if (aggregatedData[title]) {
            aggregatedData[title].count += count;
            aggregatedData[title].unreadTotal += unread;
            aggregatedData[title].phaseIds.push(statusId);
        } else {
            aggregatedData[title] = {
                title,
                subtitle,
                count,
                unreadTotal: unread,
                icon: getIconComponent(title),
                phaseIds: [statusId],
            };
        }
    });

    const dashboardItems = Object.values(aggregatedData)
        .sort((a, b) => b.count - a.count);

    const handleCardClick = async (itemTitle, itemCount, phaseIds) => {
        if (itemCount > 0) {
            setSelectedPhaseIds(phaseIds);
            setCurrentView('table');
        }
    };

    const handleBackToDashboard = () => {
        setRefresh(!refresh);
        handleSetCurrentRender('Dashboard');
        setCurrentView('dashboard');
        setSelectedPhaseIds(null);
    };

    if (currentView === 'table' && selectedPhaseIds) {
        return (
            <CardTable
                phaseIds={selectedPhaseIds}
                onBackToDashboard={handleBackToDashboard}
            />
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-100 min-h-[calc(100vh-7.25rem)]">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-200 pb-2">
                    Purchase Order & Inventory Overview
                </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dashboardItems.map((item) => (
                    <DashboardCard
                        key={item.title}
                        title={item.title}
                        subtitle={item.subtitle}
                        count={item.count}
                        unreadCount={item.unreadTotal}
                        icon={item.icon}
                        cardClick={() =>
                            handleCardClick(item.title, item.count, item.phaseIds)
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;