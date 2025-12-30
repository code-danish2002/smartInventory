import React from "react";
// Import more specific icons for better visual representation
import { FaCalendar, FaLocationDot, FaUserTie, FaBoxOpen, FaClipboardCheck } from "react-icons/fa6";
import { FaCheckCircle, FaExclamationTriangle, FaWpforms, FaCloudUploadAlt, FaWarehouse, FaTruck, FaMapMarkerAlt, FaFileAlt, FaDolly, FaTools, FaArrowDown } from "react-icons/fa";
import { FaTruckLoading } from "react-icons/fa";
import { RiRouterFill } from "react-icons/ri";
import { MdEditDocument } from "react-icons/md";
import { PackageX, Clock, Package } from "lucide-react";

const ItemHistory = ({ data = [], maxWidth = "max-w-4xl" }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  // --- Phase/Stage Configuration ---
  const phaseConfig = {
    // Stage accent colors, Icon for the Phase Header, and a descriptive title
    "PO Initiated": { color: "border-cyan-500 text-cyan-500", icon: FaWpforms, title: "Purchase Order Initiated" },
    "Inspection": { color: "border-blue-500 text-blue-500", icon: FaClipboardCheck, title: "PO Inspection" },
    "PDF Uploaded": { color: "border-teal-500 text-teal-500", icon: FaFileAlt, title: "Documentation" },
    "Refill": { color: "border-teal-500 text-teal-500", icon: MdEditDocument, title: "Re-Fill" },
    "PO Approved": { color: "border-blue-500 text-blue-500", icon: FaCheckCircle, title: "PO Approved" },
    "Store": { color: "border-purple-500 text-purple-500", icon: FaWarehouse, title: "Store Management" },
    "Site": { color: "border-green-500 text-green-500", icon: FaMapMarkerAlt, title: "Site Deployment" },
    "Spare": { color: "border-yellow-500 text-yellow-500", icon: FaTools, title: "OEM Spare" },
    "Item Dispatched": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
    "Item Received": { color: "border-green-500 text-green-500", icon: FaTruckLoading, title: "Item Receipt" },
    "Live": { color: "border-purple-500 text-purple-500", icon: RiRouterFill, title: "Active/Live" },
    "Dispatch": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
    "RMA Generated": { color: "border-red-500 text-red-500", icon: PackageX, title: "RMA" },
    "Dispatch Initiated": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
    //"Item Received": { color: "border-green-500 text-green-500", icon: FaTruckLoading, title: "Shipment Back" },
    "Default": { color: "border-gray-500 text-gray-500", icon: FaBoxOpen, title: "Unknown Phase" },
  };

  // --- Status Configuration ---
  const statusDetails = {
    // Status badge colors and associated icons for individual steps
    "PO Initiated": { color: "bg-blue-100 text-blue-800", icon: FaWpforms, description: "Purchase Order has been Initiated and sent to 'sender_username'" },
    "Inspection in Progress": { color: "bg-yellow-100 text-yellow-800", icon: FaClipboardCheck, description: "Serial Number has been submitted for Inspection, " },
    "Inspection Report Submitted": { color: "bg-teal-100 text-teal-800", icon: FaCloudUploadAlt, description: "Inspection Report has been submitted" },
    "Inspection Approved": { color: "bg-green-100 text-green-800", icon: FaCheckCircle, description: "Inspection has been approved" },
    // Dispatches
    "Item Dispatched from Vendor": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective store/site." },
    "Item Dispatched from Store": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective site." },
    "Item Dispatched from Site": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective Spare/Live." },
    "Item Dispatched from OEM Spare": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) dispatched to respective store/site." },
    "Item Dispatched from Live": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) dispatched to respective store/site." },
    // Received
    "Item Received at Store": { color: "bg-green-100 text-green-800", icon: FaDolly },
    "Item Received at Site": { color: "bg-green-100 text-green-800", icon: FaTruckLoading },
    // Spare and Live
    "Item Received at OEM Spare": { color: "bg-green-100 text-green-800", icon: FaWarehouse },
    "Item Received at Live": { color: "bg-green-100 text-green-800", icon: RiRouterFill },
    // Rejected
    "Item Rejected at Store": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
    "Item Rejected at Site": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
    // RMA
    "RMA Generated": { color: "bg-purple-100 text-purple-800", icon: Clock },
    "Dispatch Initiated": { color: "bg-teal-100 text-teal-800", icon: Package },
    "Item Received": { color: "bg-green-100 text-green-800", icon: FaDolly },
    // Other
    "Default": { color: "bg-gray-100 text-gray-800", icon: FaBoxOpen },
  };

  // --- Grouping Logic (Kept as is - it's already good) ---
  const sortedData = [...data].sort((a, b) => {
    const ta = Date.parse(a?.created_at) || 0;
    const tb = Date.parse(b?.created_at) || 0;
    return ta - tb;
  });

  const groups = [];
  let currentPhase = null;
  let currentItems = [];

  for (const item of sortedData) {
    const phase = item?.phase ?? "Default";
    if (phase === currentPhase) {
      currentItems.push(item);
    } else {
      if (currentItems.length) {
        groups.push({ phase: currentPhase, items: currentItems });
      }
      currentPhase = phase;
      currentItems = [item];
    }
  }
  if (currentItems.length) groups.push({ phase: currentPhase, items: currentItems });

  const entries = groups;

  // ------------------------------------------------------------------------------

  return (
    <div className={`w-full ${maxWidth} mx-auto max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-50`}>
      <div className="flex flex-col items-center space-y-10 p-6">
        {entries.map(({ phase: stage, items }, phaseIdx) => {
          const phaseInfo = phaseConfig[stage] || phaseConfig["Default"];
          const PhaseIcon = phaseInfo.icon;

          return (
            <React.Fragment key={`${stage}-${phaseIdx}`}>
              {/* Phase Header / Milestone Card */}
              <div
                className={`relative w-full bg-white border-l-8 ${phaseInfo.color.split(' ')[0]} p-4 pl-8 rounded-3xl shadow-2xl hover:shadow-xl transition-shadow duration-300`}
              >
                {/* Milestone Icon */}
                <div className={`absolute -left-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full border-4 ${phaseInfo.color.split(' ')[0]} shadow-md`}>
                  <PhaseIcon className={`text-2xl ${phaseInfo.color.split(' ')[1]}`} />
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-wider">{phaseInfo.title}</h3>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length} step{items.length > 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 mt-2">
                  {items.map((item, itemIdx) => {
                    const statusInfo = statusDetails[item.item_status] || statusDetails["Default"];
                    const StatusIcon = statusInfo.icon;
                    const isEven = itemIdx % 2 === 0;

                    // Improved visual separation for steps
                    return (
                      <div
                        key={item.tracking_id ?? `${phaseIdx}-${itemIdx}`}
                        className={`relative p-4 rounded-xl transition-all duration-150 ${isEven ? "bg-gray-50 border-r-4 border-dashed border-gray-200 hover:bg-gray-100" : "bg-white border-l-4 border-dashed border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex flex-col">
                          {/* Status Badge */}
                          <div className="flex items-center text-sm font-bold mb-2">
                            <StatusIcon className={`mr-2 text-xl ${statusInfo.color.split(' ')[1]}`} />
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                              {item.item_status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                            {/* Date/Time */}
                            <div className="flex items-center">
                              <FaCalendar className="mr-2 text-gray-500 text-base" />
                              <span className="font-medium">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</span>
                            </div>

                            {/* User/Receiver */}
                            {item.receiver_user_name && (
                              <div className="flex items-center">
                                <FaUserTie className="mr-2 text-gray-500 text-base" />
                                <span className="truncate" title={item.sender_user_name}>{item.sender_user_name}</span>
                              </div>
                            )}

                            {/* Location */}
                            {item.item_location && (
                              <div className="flex items-center">
                                <FaLocationDot className="mr-2 text-gray-500 text-base" />
                                <span className="truncate" title={item.item_location}>{item.item_location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phase Separator */}
              {phaseIdx < entries.length - 1 && (
                <FaArrowDown className="text-gray-400 text-4xl my-4 animate-bounce" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ItemHistory;