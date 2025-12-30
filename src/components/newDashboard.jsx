//src/components/newDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaClipboardList, // PO Re-Fills, PO Requests
    FaFileUpload,    // Upload PDF
    FaSearch,        // Approve PO
    FaStore,         // At Store
    FaTruckLoading,  // On Site
    FaTools,         // OEM Spare
    FaChartLine,     // Live
    FaRegLightbulb   // Item Requests
} from 'react-icons/fa';
import { DraftOrders } from '../utils/icons'; // My Activities icon
import NoDataAvailable from '../utils/NoDataUi';
import CardTable from './cardTable';
import { useCurrentRender } from '../context/renderContext';
import { Bell } from 'lucide-react';

// --- Static Data Definitions (from your request) ---
const phases = {
    0: "My Activities",
    1: "Item Requests",
    2: "Upload PDF",
    3: "PO Re-Fills",
    4: "Approve PO",
    7: "At Store",
    8: "At Store",
    9: "On Site",//"OEM Spare",
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

// --- Helper Function to Map Phase to an Icon ---
const getIconComponent = (phase) => {
    switch (phase) {
        case "My Activities":
            return DraftOrders;
        case "PO Re-Fills":
            return FaClipboardList;
        case "Upload PDF":
            return FaFileUpload;
        case "Approve PO":
            return FaSearch;
        case "At Store":
            return FaStore;
        case "On Site":
            return FaTruckLoading;
        case "OEM Spare":
            return FaTools;
        case "Item Requests":
            return FaRegLightbulb;
        case "Live":
            return FaChartLine;
        default:
            return FaClipboardList;
    }
};

// --- 2. DashboardCard Component (The Visual Unit) ---
const DashboardCard = ({ title, subtitle, count, icon: IconComponent, cardClick, showBell }) => {
    const isActive = count > 0;
    const cardClass = isActive
        ? 'bg-white shadow-xl border-t-4 border-indigo-600 cursor-pointer'
        : 'bg-white shadow-md border-t-4 border-gray-200';
    const countClass = isActive ? 'text-indigo-600' : 'text-gray-500';
    const iconWrapperClass = isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400';

    return (
        <div onClick={cardClick} className={`p-6 rounded-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${cardClass}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {title}
                    </h3>
                    {/* The Count - Big and Bold */}
                    <p className={`text-4xl font-extrabold mt-1 ${countClass}`}>
                        {count}
                    </p>
                </div>
                {/* The Icon */}
                <span className={`p-3 rounded-full ${iconWrapperClass}`}>
                    <IconComponent size={24} />
                </span>
            </div>

            {/* Detailed Description */}
            <div className="mt-4 flex justify-between items-center border-t pt-3">
                <p className="text-xs text-gray-500">
                    {subtitle}
                </p>
                {showBell && (
                    <Bell className="text-green-500 animate-bounce" size={14} title="Recent Activity" />
                )}
            </div>
        </div>
    );
};


// --- 3. Dashboard Component (The Container) ---
const NewDashboard = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = React.useState('dashboard');
    const [selectedPhaseIds, setSelectedPhaseIds] = React.useState(null);
    //const { handleSetCurrentRender } = useCurrentRender();
    const [data, setData] = React.useState(null);
    const [notifications, setNotifications] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let ws;
        let isMounted = true;

        const connect = () => {
            // Use 127.0.0.1 to avoid IPv6 resolution issues with 'localhost'
            ws = new WebSocket('ws://172.27.41.96:8080');

            ws.onopen = () => {
                if (isMounted) console.log("✅ Connected to Inventory Stream");
            };

            ws.onmessage = (event) => {
                if (!isMounted) return;
                const response = JSON.parse(event.data);

                // Note: Your python sends 'INITIAL_STATE' and 'DASHBOARD_UPDATE'
                // Both contain the counts inside response.data
                if (response.data) {
                    setData(response.data);
                    setLoading(false);
                }

                if (response.event) {
                    const { status_id, timestamp } = response.event;
                    setNotifications(prev => ({
                        ...prev,
                        [status_id]: new Date(timestamp).getTime()
                    }));
                }
            };

            ws.onclose = (e) => {
                if (isMounted) {
                    console.log("ℹ️ WebSocket Closed:", e.code);
                    // Reconnect logic if needed
                    if (e.code !== 1000) {
                        setTimeout(connect, 2000);
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("❌ WebSocket Error:", err);
            };
        };

        connect();

        return () => {
            isMounted = false;
            if (ws) ws.close();
        };
    }, []);

    const shouldShowBell = (phaseIds) => {
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        const now = Date.now();

        // Check if any status_id in this card was updated recently
        return phaseIds.some(id => {
            const lastUpdate = notifications[id];
            return lastUpdate && (now - lastUpdate < TWELVE_HOURS);
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-50 p-6">
                <p className="text-xl text-indigo-500 animate-pulse">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if ((!data || !data.success || !data.dashboard || Object.keys(data.dashboard).length === 0) && !loading) {
        return (<NoDataAvailable />);
    }


    // --- Data Processing Logic ---
    const rawData = data.dashboard;

    // Create a Set to handle duplicate phase names (e.g., keys 3 and 4 are both "Approve PO")
    const aggregatedData = {};

    Object.entries(rawData).forEach(([key, count]) => {
        const index = parseInt(key);
        const title = phases[index];
        const subtitle = information[index];

        if (title !== undefined && subtitle !== undefined) {
            // Aggregate counts for items with the same phase name but different keys
            if (aggregatedData[title]) {
                aggregatedData[title].count += count;
            } else {
                aggregatedData[title] = {
                    title,
                    subtitle,
                    count,
                    icon: getIconComponent(title),
                    phaseIds: [key], // Store original keys for potential use
                };
            }
        }
    });

    // Convert aggregated object back to a sorted array (highest count first)
    const dashboardItems = Object.values(aggregatedData)
        .sort((a, b) => b.count - a.count);

    const handleCardClick = (itemTitle, itemCount, phaseId) => {
        if (itemCount > 0) {
            //navigate('/showData', { state: { phaseId, } });
            setSelectedPhaseIds(phaseId);
            setCurrentView('table');
        } else {
            console.log(`${itemTitle} has a count of 0. No action taken.`);
        }
    };

    const handleBackToDashboard = () => {
        refresh();
        handleSetCurrentRender('Dashboard');
        setCurrentView('dashboard');
        setSelectedPhaseIds(null);
    };

    if (currentView === 'table' && selectedPhaseIds) {
        return <CardTable
            phaseIds={selectedPhaseIds}
            onBackToDashboard={handleBackToDashboard}
        />;
    }


    // --- Rendering ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-100 min-h-[calc(100vh-9.75rem)]">

            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-200 pb-2">
                    Purchase Order & Inventory Overview
                </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dashboardItems.map((item) => (
                    <DashboardCard
                        key={item.title} // Use title as key since we aggregated by it
                        title={item.title}
                        subtitle={item.subtitle}
                        count={item.count}
                        icon={item.icon}
                        cardClick={() => handleCardClick(item.title, item.count, item.phaseIds)}
                        showBell={shouldShowBell(item.phaseIds)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewDashboard;