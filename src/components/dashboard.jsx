import { useEffect, useState } from "react";
import GlobalLoading from "../globalLoading.jsx";
import { useNavigate } from "react-router-dom";
import { CartCrossBroken, CicsSitOverrides, CloudUpload, DraftOrders, ParcelTracker, Store, StoreRemove02 } from "../utils/icons.jsx";
import { IoSearchCircle } from "react-icons/io5";

const Dashboard = ({ apiData, loading }) => {
    const navigate = useNavigate();


    const handleDeviceClick = (phaseId) => {
        navigate('/showData', { state: { phaseId, } });
    };

    if (Array.isArray(apiData)) {
        return null; // or handle the case where apiData is an array
    }

    const phases = {
        0: "My POs",
        1: "Add PDF",
        2: "PO Re-Fills",
        3: "Inspection",
        4: "Inspection",
        5: "Store Rejects",
        6: "Site Rejects",
        7: "At Store",
        8: "At Store",
        9: "Inventory",
        10: "On Site",
        11: "On Site",
        12: "Inventory",
    }

    const negativePhases = {
        2: "PO Re-Fills",
        5: "Store Rejects",
        6: "Site Rejects",
    }

    const icons = {
        "My POs": <DraftOrders className="w-12 h-12 text-blue-500 group-hover:text-gray-600" />,
        "Add PDF": <CloudUpload className="w-12 h-12 text-indigo-500 group-hover:text-gray-600" />,
        Inspection: <IoSearchCircle className="w-16 h-16 text-orange-300 group-hover:text-gray-600" />,
        'PO Re-Fills': <CicsSitOverrides className=" w-12 h-12 text-gray-600 group-hover:text-gray-600" />,
        'At Store': <Store className="w-12 h-12 text-green-500 group-hover:text-gray-600" />,
        'On Site': <ParcelTracker className="w-16 h-16 text-yellow-900 group-hover:text-gray-600" />,
        'Store Rejects': <StoreRemove02 className="w-12 h-12 text-red-500 group-hover:text-gray-600" />,
        'Site Rejects': <CartCrossBroken className="w-16 h-16 text-red-500 group-hover:text-gray-600" />,
    }

    const countGradients = {
        "My POs": "from-blue-500 via-blue-300 to-blue-200",
        "Add PDF": "from-indigo-800 via-indigo-400 to-purple-200",
        Inspection: "from-amber-400 via-orange-300 to-yellow-400",
        'PO Re-Fills': "from-gray-400 via-gray-200 to-gray-600",
        'At Store': "from-green-400 via-lime-300 to-yellow-200",
        'On Site': "from-yellow-900 via-amber-600 to-yellow-500",
        'Store Rejects': "from-red-500 via-orange-400 to-yellow-400",
        'Site Rejects': "from-red-500 via-orange-400 to-yellow-400",
    };

    const dataLength = Object.keys(apiData).length;
    return (
        <div className="flex flex-col items-center w-full h-max p-4 md:p-6 overflow-hidden">
            {loading ? (
                <GlobalLoading />
            ) : dataLength > 0 ? (
                <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 
                    w-full ${dataLength > 4
                            ? "h-full"
                            : "max-h-[80vh] overflow-y-auto no-scrollbar"
                        } overflow-y-auto no-scrollbar`}
                >
                    {Object.entries(apiData).map(([id, count]) => (
                        <div
                            key={id}
                            onClick={() => { count && handleDeviceClick(id) }}
                            className={`relative bg-white rounded-lg shadow-md p-2 hover:shadow-lg 
                        transition-shadow duration-200 min-h-[250px] cursor-pointer 
                        flex flex-col ${dataLength <= 5 ? "justify-center max-h-[250px]" : "justify-between"}`}
                        >
                            <div className="h-full text-center mt-6">
                                <div className="h-3/6 flex flex-row items-center justify-center gap-4">
                                    {icons[phases[id]] ? icons[phases[id]] : null}
                                    <h3 className="truncate font-semibold text-[clamp(2rem,2.5vw,3rem)] mb-2">{phases[id]}</h3>
                                </div>
                                <p className={`h-2/6 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b ${countGradients[phases[id]]}`}>{count}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <h1 className="text-2xl text-gray-500">Not found</h1>
                </div>
            )}
            {/* <div className="w-full border-dashed border-2 border-gray-300"></div> */}
            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default Dashboard; 