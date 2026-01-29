import React from "react";
import ReactModal from "react-modal";
import api from "../api/apiCall"; 
import { CheckSquare, Clock, FileText, MapPin, Package, Settings, User } from "lucide-react";

/**
 * Utility function to format date strings
 * @param {string} dateString
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * ShowItemsDetails Component - Displays detailed tracking information in a modal.
 * @param {object} props
 * @param {string} props.serialNumber The serial number to fetch details for.
 * @param {function} props.closeModal Function to close the modal.
 */
export const ShowItemsDetails = ({ serialNumber, closeModal }) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [data, setData] = React.useState(null);

    // Effect for fetching data
    React.useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`/api/tracking/serial/${serialNumber}`)
            .then((res) => {
                setData(res.data.data); 
            })
            .catch((err) => {
                console.error("API Fetch Error:", err);
                setData(null);
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [serialNumber]);

    // Effect for 'Escape' key close (Retained)
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeModal]);

    // Custom ReactModal styling (Retained)
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', 
            maxWidth: '1200px', 
            maxHeight: '90vh', 
            padding: '0', 
            border: 'none',
            borderRadius: '0.5rem',
            overflow: 'hidden', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
        }
    };

    const poData = data?.po_data || {};
    const poLine = data?.po_line || {};
    const poItem = data?.po_item || {}; 
    const activities = data?.activities || [];
    const latestActivity = activities.length > 0 ? activities[activities.length - 1] : {};

    return (
        <ReactModal
            isOpen={true}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel={`Details for Serial Number: ${poItem.item_serial_number}`}
        >
            <div className="flex flex-col h-[90vh]"> 
                
                {/* Header - Fixed height */}
                <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200 shrink-0">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Item Details: <span className="text-indigo-600">{poItem.item_serial_number}</span>
                    </h1>
                    <button 
                        onClick={closeModal} 
                        className="text-gray-400 hover:text-gray-600 transition duration-150"
                        aria-label="Close Modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Content Area - Takes remaining height and handles scroll */}
                <div className="p-6 overflow-y-auto flex-grow">
                    {loading && (
                        <div className="flex justify-center items-center h-full text-lg text-indigo-600">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                            Loading Item Details...
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                            <p>Could not fetch details for serial number {serialNumber}. Please try again.</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <div className="space-y-6">
                            
                            {/* ROW 1: Current Status Summary (Full Width) */}
                            <div className="bg-white shadow-xl rounded-xl p-6 border border-indigo-100">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="text-indigo-600 mr-2">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002.944 12c.005 3.003 1.096 5.86 3.04 8.618A12.001 12.001 0 0012 21.056c3.003-.005 5.86-1.096 8.618-3.04A12.001 12.001 0 0021.056 12a12.001 12.001 0 00-3.04-8.618z"></path></svg>
                                    </span>
                                    Current Tracking Status
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InfoBox title="Current Status" value={latestActivity.item_status || 'N/A'} icon={latestActivity.item_status && <CheckSquare className="w-4 h-4"/>} color="text-green-600" />
                                    <InfoBox title="Current Owner" value={latestActivity.receiver_user_name || 'N/A'} icon={latestActivity.receiver_user_name && <User className="w-4 h-4"/>} color="text-yellow-600" />
                                    <InfoBox title="Location" value={latestActivity.item_location || 'N/A'} icon={latestActivity.item_location && <MapPin className="w-4 h-4"/>} color="text-blue-600" />
                                </div>
                            </div>
                            
                            {/* ROW 2: Item Definition Details (2 Columns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Item Specification Details (NEW PO_ITEM) */}
                                {console.log('PO Item Data:', poItem)}
                                <DetailCard title="Item Specification Details" icon={<Settings className="w-5 h-5" />} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        <DetailItem label="Item Type" value={poItem.item_type_name} />
                                        <DetailItem label="Manufacturer (Make)" value={poItem.item_make_name} />
                                        <DetailItem label="Model Name" value={poItem.item_model_name} />
                                        <DetailItem label="Part Code" value={poItem.item_part_code} />
                                        <DetailItem label="Serial Number" value={poItem.item_serial_number} />
                                        <DetailItem label="Project Number" value={poItem.project_number} />
                                    </div>
                                    <DetailItem label="Part Description" value={poItem.item_part_description} isDescription={true} className="mt-4" />
                                </DetailCard>

                                {/* PO Line Item Details */}
                                <DetailCard title="PO Line Item Details" icon={<Package className="w-5 h-5" />} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        <DetailItem label="Line Number" value={poLine.line_number} />
                                        <DetailItem label="Line Name" value={poLine.line_name} />
                                        <DetailItem label="PO Authority" value={poData.purchase_authority} />
                                        <DetailItem label="Inspection Authority" value={poData.inspection_authority} />
                                    </div>
                                    <DetailItem label="Line Description" value={poLine.description} isDescription={true} className="mt-4" />
                                </DetailCard>
                            </div>

                            {/* ROW 3: Contextual Details (PO & Tracking Timeline) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Purchase Order Details (2/3 Width) */}
                                <div className="lg:col-span-2">
                                    <DetailCard title="Purchase Order Details" icon={<FileText className="w-5 h-5" />} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 h-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                            <DetailItem label="PO Number" value={poData.po_number} />
                                            <DetailItem label="Issue Date" value={formatDate(poData.po_date_of_issue)} />
                                            <DetailItem label="Firm Name" value={poData.firm_name} className="sm:col-span-3" />
                                            <DetailItem label="Tender Number" value={poData.tender_number} className="sm:col-span-3" />
                                        </div>
                                        <DetailItem label="PO Description" value={poData.po_description} isDescription={true} className="mt-4" />
                                    </DetailCard>
                                </div>
                                
                                {/* Tracking History (1/3 Width) */}
                                <div className="lg:col-span-1">
                                    {/* Scroll fix retained: max-h-[70vh] and overflow-y-auto */}
                                    <DetailCard title="Tracking History" icon={<Clock className="w-5 h-5" />} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 max-h-[70vh] overflow-y-auto">
                                        <TrackingTimeline activities={activities} />
                                    </DetailCard>
                                </div>

                            </div>

                        </div>
                    )}
                </div>
            </div>
        </ReactModal>
    );
};

// --- Sub-Components (Unchanged) ---

const InfoBox = ({ title, value, color, icon }) => (
    <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
        {icon && <span className={`${color}`}>{icon}</span>}
    </div>
);

const DetailCard = ({ title, icon, children, className = "" }) => (
    <div className={className}>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center">
            {/* Render the icon here using flex utility classes */}
            {icon && <span className="text-indigo-600 mr-2">{icon}</span>}
            {title}
        </h3>
        {children}
    </div>
);

const DetailItem = ({ label, value, isDescription = false, className = '' }) => (
    <div className={`mb-3 ${isDescription ? 'col-span-full' : ''} ${className}`}>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-900 break-words">{value}</p>
    </div>
);

const TrackingTimeline = ({ activities }) => {
    // Reverse the activities to show the newest at the top
    const sortedActivities = [...activities].reverse();

    if (sortedActivities.length === 0) {
        return <p className="text-gray-500 text-center py-4">No tracking history available.</p>;
    }

    return (
        <div className="relative border-l-2 border-indigo-200 pl-4">
            {sortedActivities.map((activity, index) => (
                <div key={activity.tracking_id} className="mb-8 relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-5 top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></div>
                    
                    {/* Content */}
                    <div className="bg-white p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
                        <p className="text-sm font-semibold text-indigo-600 mb-1">{activity.item_status}</p>
                        <p className="text-xs text-gray-500 mb-2">
                            <span className="font-medium text-gray-700">{activity.phase}</span>
                            {" "} - {formatDate(activity.created_at)}
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>From:</strong> {activity.sender_user_name}</p>
                            <p><strong>To:</strong> {activity.receiver_user_name}</p>
                            <p><strong>Location:</strong> {activity.item_location}</p>
                            {activity.remarks && <p><strong>Remarks:</strong> {activity.remarks}</p>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};