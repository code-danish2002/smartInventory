import React from "react";
import { FaCalendar, FaLocationDot, FaUserTie, FaStore, FaHammer, FaArrowDown, FaBoxOpen, FaClipboardCheck, FaC } from "react-icons/fa6";
import { FaCheckCircle, FaExclamationTriangle, FaWpforms, FaCloudUploadAlt, FaWarehouse, FaTruck  } from "react-icons/fa";
import { FaTruckLoading } from "react-icons/fa";
import { RiRouterFill } from "react-icons/ri";

const ItemHistory = ({ data = [], maxWidth = "max-w-4xl" }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  // Stage accent colors
  const stageColors = {
    "PO Initiated": "border-cyan-400",
    "Approve PO": "border-blue-400",
    "PDF Uploaded": "border-teal-400",
    "At Store": "border-purple-400",
    "On Site": "border-green-400",
    "OEM Spare": "border-yellow-400",
    "Item Dispatched": "border-teal-400",
    "Item Received": "border-green-400",
    "Live": "border-purple-400",
    "Dispatch": "border-teal-400",
    "Default": "border-gray-400",
  };

  // Status badge colors and associated icons
  const statusDetails = {
    "PO Initiated": { color: "bg-blue-100 text-blue-800", icon: FaWpforms },
    "Inspection in Progress": { color: "bg-yellow-100 text-yellow-800", icon: FaClipboardCheck },
    "Inspection Report Submitted": { color: "bg-blue-100 text-blue-800", icon: FaCloudUploadAlt },
    "Inspection Approved": { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
    //dispatches
    "Item Dispatched from Vendor": { color: "bg-teal-100 text-teal-800", icon: FaTruck },
    "Item Dispatched from Store": { color: "bg-teal-100 text-teal-800", icon: FaTruck },
    "Item Dispatched from Site": { color: "bg-teal-100 text-teal-800", icon: FaTruck },
    "Item Dispatched from OEM Spare": { color: "bg-teal-100 text-teal-800", icon: FaTruck },
    "Item Dispatched from Live": { color: "bg-teal-100 text-teal-800", icon: FaTruck },
    //Received
    "Item Received at Store": { color: "bg-green-100 text-green-800", icon: FaTruckLoading },
    "Item Received at Site": { color: "bg-green-100 text-green-800", icon: FaTruckLoading },
    //Spare and Live
    "Item Received at OEM Spare": { color: "bg-green-100 text-green-800", icon: FaWarehouse },
    "Item Received at Live": { color: "bg-green-100 text-green-800", icon: RiRouterFill },
    //Rejected
    "Item Rejected at Store": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
    "Item Rejected at Site": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
    // Other
    "Default": { color: "bg-gray-100 text-gray-800", icon: FaBoxOpen },
  };

  // ---------- NEW: Create groups of consecutive phases in chronological order ----------
  // 1. Sort the whole list by created_at (oldest -> newest). If created_at is missing/invalid, keep original relative order.
  const sortedData = [...data].sort((a, b) => {
    const ta = Date.parse(a?.created_at) || 0;
    const tb = Date.parse(b?.created_at) || 0;
    return ta - tb;
  });

  // 2. Scan sorted data and group consecutive items that share the same phase.
  const groups = [];
  let currentPhase = null;
  let currentItems = [];

  for (const item of sortedData) {
    const phase = item?.phase ?? "Unknown";
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

  // `groups` is an array like [{ phase: "Upload", items: [...] }, { phase: "Inspection", items: [...] }, ...]
  const entries = groups; // your rendering loop expects entries

  // ------------------------------------------------------------------------------

  return (
    <div className={`w-full ${maxWidth} mx-auto max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
      <div className="flex flex-col items-center space-y-8 p-6">
        {entries.map(({ phase: stage, items }, phaseIdx) => (
          <React.Fragment key={`${stage}-${phaseIdx}`}>
            {/* Phase Header / Milestone Card */}
            <div
              className={`relative w-full bg-white border-l-4 ${stageColors[stage] || stageColors["Default"]} p-4 pl-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200`}
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full border-4 border-current">
                 <FaClipboardCheck className={`text-xl ${
                    stage === "Upload" ? "text-cyan-500" :
                    stage === "Approve PO" ? "text-blue-500" :
                    stage === "At Store" ? "text-purple-500" :
                    stage === "Site" ? "text-green-500" : "text-blue-500"

                 }`} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-extrabold text-gray-800">{stage}</h3>
                <span className="text-sm text-gray-500">{items.length} step{items.length > 1 ? "s" : ""}</span>
              </div>

              <div className="space-y-4 pt-2">
                {items.map((item, itemIdx) => {
                  const statusInfo = statusDetails[item.item_status] || statusDetails["Default"];
                  const StatusIcon = statusInfo.icon;
                  const isEven = itemIdx % 2 === 0;

                  return (
                    <div
                      key={item.tracking_id ?? `${phaseIdx}-${itemIdx}`}
                      className={`relative flex items-start p-3 bg-gray-50 rounded-lg shadow-sm ${
                        isEven ? "pr-10" : "pl-10 justify-end flex-row-reverse"
                      }`}
                    >
                      <div className={`absolute w-full h-full border-dashed border-l-2 border-gray-300 left-1/2 -translate-x-1/2 ${
                          isEven ? 'border-r-0' : 'border-l-0'
                      }`}>
                          <div className={`absolute w-3 h-3 bg-gray-400 rounded-full top-1/2 -translate-y-1/2 ${
                              isEven ? '-left-2' : '-right-2'
                          }`}></div>
                      </div>

                      <div className={`flex flex-col flex-grow z-10 bg-gray-50 p-2 rounded-lg ${
                          isEven ? "text-left" : "text-right"
                      }`}>
                        <div className="flex items-center text-sm font-semibold mb-1">
                          <StatusIcon className={`mr-2 text-lg ${statusInfo.color.includes('green') ? 'text-green-600' : statusInfo.color.includes('yellow') ? 'text-yellow-600' : statusInfo.color.includes('red') ? 'text-red-600' : statusInfo.color.includes('blue') ? 'text-blue-600' : statusInfo.color.includes('teal') ? 'text-teal-600' : statusInfo.color.includes('purple') ? 'text-purple-600' : statusInfo.color.includes('cyan') ? 'text-cyan-600' : 'text-gray-600'}`} />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {item.item_status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 flex items-center mb-0.5">
                          <FaCalendar className="mr-1" />
                          {item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "—"}
                        </div>
                        {item.sender_user_name && (
                          <div className="text-xs text-gray-600 flex items-center mb-0.5">
                            <FaUserTie className="mr-1" />
                            {item.sender_user_name}
                          </div>
                        )}
                        {item.item_location && (
                          <div className="text-xs text-gray-600 flex items-center">
                            <FaLocationDot className="mr-1" />
                            {item.item_location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {phaseIdx < entries.length - 1 && (
              <FaArrowDown className="text-gray-400 text-3xl my-3 animate-bounce" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ItemHistory;
