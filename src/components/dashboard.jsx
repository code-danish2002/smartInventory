import GlobalLoading from "../globalLoading.jsx";
import { useNavigate } from "react-router-dom";
import { CartCrossBroken, CicsSitOverrides, CloudUpload, DraftOrders, Live, ParcelTracker, Store, StoreRemove02 } from "../utils/icons.jsx";
import { IoSearchCircle } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";
import { MdOutlineInventory } from "react-icons/md";

const Dashboard = ({ apiData, loading }) => {
    const navigate = useNavigate();


    const handleDeviceClick = (phaseId) => {
        navigate('/showData', { state: { phaseId, } });
    };

    if (Array.isArray(apiData)) {
        return null; // or handle the case where apiData is an array
    }

    const phases = {
        0: "My Activities",
        1: "Upload PDF",
        2: "PO Re-Fills",
        3: "Inspection",
        4: "Inspection",
        7: "At Store",
        8: "At Store",
        9: "OEM Spare",
        10: "On Site",
        11: "On Site",
        12: "OEM Spare",
        13: "Item Requests",
        14: "Live",
    }

    const icons = {
        "My Activities": <DraftOrders className="w-12 h-12 text-blue-500 group-hover:text-gray-600" />,
        "Upload PDF": <CloudUpload className="w-12 h-12 text-indigo-500 group-hover:text-gray-600" />,
        Inspection: <IoSearchCircle className="w-16 h-16 text-orange-300 group-hover:text-gray-600" />,
        'PO Re-Fills': <CicsSitOverrides className=" w-12 h-12 text-gray-600 group-hover:text-gray-600" />,
        'At Store': <Store className="w-12 h-12 text-green-500 group-hover:text-gray-600" />,
        'On Site': <ParcelTracker className="w-16 h-16 text-yellow-900 group-hover:text-gray-600" />,
        'Store Rejects': <StoreRemove02 className="w-12 h-12 text-red-500 group-hover:text-gray-600" />,
        'Site Rejects': <CartCrossBroken className="w-16 h-16 text-red-500 group-hover:text-gray-600" />,
        'Item Requests': <TbListDetails className="w-12 h-12 text-teal-500 group-hover:text-teal-600" />,
        'OEM Spare': <MdOutlineInventory className="w-12 h-12 text-sky-500 group-hover:text-sky-600" />,
        'Live': <Live className="w-12 h-12 text-green-600 group-hover:text-green-800" />,
    }

    const countGradients = {
        "My Activities": "from-blue-500 via-blue-300 to-blue-200",
        "Upload PDF": "from-indigo-800 via-indigo-400 to-purple-200",
        Inspection: "from-amber-400 via-orange-300 to-yellow-400",
        'PO Re-Fills': "from-gray-400 via-gray-200 to-gray-600",
        'At Store': "from-green-400 via-lime-300 to-yellow-200",
        'On Site': "from-yellow-900 via-amber-600 to-yellow-500",
        'Store Rejects': "from-red-500 via-orange-400 to-yellow-400",
        'Site Rejects': "from-red-500 via-orange-400 to-yellow-400",
        'Item Requests': "from-teal-400 via-teal-200 to-teal-600",
        'OEM Spare': "from-sky-400 via-sky-200 to-sky-600",
        'Live': "from-green-600 via-green-400 to-green-200",
    };

    const information = {
        0: "POs you worked on",
        1: "Upload PDF to POs",
        2: "POs that need correction",
        3: "POs sent to you for inspection",
        4: "POs sent to you for inspection",
        7: "Items that are at the store",
        8: "Items that are at the store",
        9: "Items that are at the OEM Spare",
        10: "Items that are at the site",
        11: "Items that are at the site",
        12: "Items that are at the OEM Spare",
        13: "Add Requests for Item of PO",
        14: "Items that are live in the inventory",
    }

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
                    {[
                        "0", // My Activities first
                        "13", // Item Requests second
                        ...Object.keys(apiData).filter(k => k !== "0" && k !== "13" && k !== "2"),
                        "2",
                    ].map(id => (
                        <div
                            key={id}
                            title={information[id]}
                            onClick={() => { apiData[id] && handleDeviceClick(id) }}
                            className={`relative bg-white rounded-lg shadow-md p-2 hover:shadow-lg 
                        transition-shadow duration-200 min-h-[250px] cursor-pointer 
                        flex flex-col ${dataLength <= 5 ? "justify-center max-h-[250px]" : "justify-between"}`}
                        >
                            {/* <span title={information[id]} className="absolute top-2 right-2 text-sm text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
                                <FaInfoCircle />
                            </span> */}
                            <div className="h-full text-center mt-6">
                                <div className="h-3/6 flex flex-row items-center justify-center gap-4">
                                    {icons[phases[id]] ? icons[phases[id]] : null}
                                    <h3 className="truncate font-semibold text-[clamp(2rem,2.5vw,3rem)] mb-2">{phases[id]}</h3>
                                </div>
                                <p className={`h-2/6 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b ${countGradients[phases[id]]}`}>{apiData[id]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-[80vh]">
                    <h1 className="text-2xl text-gray-500">No Data</h1>
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