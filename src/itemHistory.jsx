import React from "react";
import { Clock, Package, FilePenLine, PackageX, MapPin, User, ClipboardCheck, CheckCircle2, FileText, CloudUpload, Truck, Box, ChevronRight, ChevronLeft, ArrowDown, } from "lucide-react";
import { FaTools, FaDolly, FaTruckLoading } from "react-icons/fa";
import { RiRouterFill } from "react-icons/ri";
import { color } from "framer-motion";

const Icons = {
  Dolly: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="2" /><circle cx="18" cy="21" r="2" /><path d="M5 21V5a2 2 0 0 1 2-2h10" /><path d="M5 13h10" /><path d="M5 17h10" /><path d="M19 13v6" />
    </svg>
  ),
};

const ItemHistory = ({ data = [] }) => {
  const [columns, setColumns] = React.useState(4);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(4);
      else if (width >= 1024) setColumns(3);
      else if (width >= 768) setColumns(2);
      else setColumns(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
        <PackageX size={48} className="mb-2 opacity-20" />
        <p>No history data available.</p>
      </div>
    );
  }

  const statusDetails = {
    "PO Initiated": { color: "bg-blue-500", icon: FileText, lightColor: "text-blue-600 bg-blue-50" },
    "Inspection in Progress": { color: "bg-yellow-500", icon: ClipboardCheck, lightColor: "text-yellow-600 bg-yellow-50" },
    "Inspection Report Submitted": { color: "bg-teal-500", icon: CloudUpload, lightColor: "text-teal-600 bg-teal-50" },
    "Inspection Approved": { color: "bg-green-500", icon: CheckCircle2, lightColor: "text-green-600 bg-green-50" },
    "Correction Required": { color: "bg-orange-500", icon: FilePenLine, lightColor: "text-orange-600 bg-orange-50" },

    //Dispatches
    "Item Dispatched from Vendor": { color: "bg-indigo-500", icon: Truck, lightColor: "text-indigo-600 bg-indigo-50" },
    "Item Dispatched from Store": { color: "bg-indigo-500", icon: Truck, lightColor: "text-indigo-600 bg-indigo-50" },
    "Item Dispatched from Site": { color: "bg-indigo-500", icon: Truck, lightColor: "text-indigo-600 bg-indigo-50" },
    "Item Dispatched from OEM Spare": { color: "bg-indigo-500", icon: Truck, lightColor: "text-indigo-600 bg-indigo-50" },
    "Item Dispatched from Live": { color: "bg-indigo-500", icon: Truck, lightColor: "text-indigo-600 bg-indigo-50" },


    //Receives
    "Item Received at Store": { color: "bg-emerald-500", icon: FaDolly, lightColor: "text-emerald-600 bg-emerald-50" },
    "Item Received at Site": { color: "bg-emerald-500", icon: FaTruckLoading, lightColor: "text-emerald-600 bg-emerald-50" },
    "Item Received at OEM Spare": { color: "bg-emerald-500", icon: Icons.Dolly, lightColor: "text-emerald-600 bg-emerald-50" },
    "Item Received at Live": { color: "bg-emerald-500", icon: Icons.Dolly, lightColor: "text-emerald-600 bg-emerald-50" },

    "Item in Spare Inventory": { color: "bg-teal-500", icon: FaTools, lightColor: "text-teal-600 bg-teal-50" },
    "Item Commissioned": { color: "bg-teal-500", icon: RiRouterFill, lightColor: "text-teal-600 bg-teal-50" },

    //Rejects
    "Item Rejected at Store": { color: "bg-red-500", icon: PackageX, lightColor: "text-red-600 bg-red-50" },
    "Item Rejected at Site": { color: "bg-red-500", icon: PackageX, lightColor: "text-red-600 bg-red-50" },

    //RMAs
    "RMA Generated": { color: "bg-purple-500", icon: Clock, lightColor: "text-purple-600 bg-purple-50" },
    "Dispatch Initiated": { color: "bg-purple-500", icon: Truck, lightColor: "text-purple-600 bg-purple-50" },
    "Item Received": { color: "bg-purple-500", icon: CheckCircle2, lightColor: "text-purple-600 bg-purple-50" },

    //Others
    "Default": { color: "bg-gray-500", icon: Box, lightColor: "text-gray-600 bg-gray-50" },
  };

  const sortedData = [...data].sort((a, b) => Date.parse(a?.created_at) - Date.parse(b?.created_at));

  return (
    <div className="w-full max-w-full max-h-[80vh] bg-slate-50 overflow-y-auto px-3 py-6 md:p-8 lg:p-12 font-sans">
      <style>{`
        @keyframes flowHorizontal { from { background-position: 0 0; } to { background-position: 24px 0; } }
        @keyframes flowHorizontalReverse { from { background-position: 24px 0; } to { background-position: 0 0; } }
        @keyframes flowVertical { from { background-position: 0 0; } to { background-position: 0 24px; } }
        
        .animate-flow-right {
          background-image: linear-gradient(to right, #3b82f6 30%, transparent 30%);
          background-size: 12px 2px;
          animation: flowHorizontal 0.8s linear infinite;
        }
        .animate-flow-left {
          background-image: linear-gradient(to right, #3b82f6 30%, transparent 30%);
          background-size: 12px 2px;
          animation: flowHorizontalReverse 0.8s linear infinite;
        }
        .animate-flow-down {
          background-image: linear-gradient(to bottom, #3b82f6 30%, transparent 30%);
          background-size: 2px 12px;
          animation: flowVertical 0.8s linear infinite;
        }
      `}</style>

      <div
        className="grid gap-x-12 gap-y-24 md:gap-x-16 md:gap-y-32 relative"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {sortedData.map((item, index) => {
          const details = statusDetails[item.item_status] || statusDetails["Default"];
          const StatusIcon = details.icon;

          const rowIndex = Math.floor(index / columns);
          const colIndex = index % columns;
          const isEvenRow = rowIndex % 2 === 0;
          const isLastOverall = index === sortedData.length - 1;

          const gridColumn = isEvenRow ? colIndex + 1 : columns - colIndex;
          const isLastInRow = colIndex === columns - 1;

          return (
            <div
              key={item.tracking_id}
              className="relative min-h-[170px]"
              style={{ gridColumn: gridColumn, gridRow: rowIndex + 1 }}
            >
              {/* ACCURATE CONNECTOR PLACEMENT */}
              {!isLastOverall && (
                <div className={`absolute z-0 pointer-events-none flex items-center justify-center
                  ${columns === 1 ? 'top-full left-1/2 -translate-x-1/2 h-24 w-0.5 animate-flow-down' :
                    isLastInRow ? 'top-full left-1/2 -translate-x-1/2 h-32 w-0.5 animate-flow-down' :
                      isEvenRow ? 'top-1/2 left-full w-16 h-0.5 animate-flow-right' :
                        'top-1/2 right-full w-16 h-0.5 animate-flow-left'}
                `}>
                  {/* Arrow Indicator Bubble */}
                  <div className={`absolute w-6 h-6 bg-white border border-blue-100 rounded-full text-blue-600 shadow-md flex items-center justify-center z-20 transform
                    ${(isLastInRow || columns === 1) ? 'bottom-[1.4rem]' : isEvenRow ? 'right-0' : 'left-0'}
                  `}>
                    {(isLastInRow || columns === 1) ? (
                      <ArrowDown size={14} />
                    ) : isEvenRow ? (
                      <ChevronRight size={14} />
                    ) : (
                      <ChevronLeft size={14} />
                    )}
                  </div>
                </div>
              )}

              {/* CARD UI - Restored Original Look */}
              <div className="absolute top-0 left-0 w-full bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 z-10 group h-auto max-h-[200px] hover:max-h-[500px]">
                {/* Floating Icon */}
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ${details.color}`}>
                  <StatusIcon size={24} />
                </div>

                <div className="mt-6 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${details.lightColor}`}>
                    {item.phase}
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-sm leading-tight h-10 flex items-center justify-center px-2">
                    {item.item_status}
                  </h4>

                  {/* Date Badge */}
                  <div className="mt-3 mb-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Clock size={12} className="text-gray-300" />
                    {new Date(item.created_at).toLocaleString()}
                  </div>

                  <div className="hidden group-hover:block transition-all duration-500">
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <User size={12} className="text-gray-300" />
                        <span className="font-medium truncate">{item.receiver_user_name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <MapPin size={12} className="text-red-300" />
                        <span className="truncate">{item.item_location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sequence Number Bubble */}
              <div className="absolute -bottom-4 -right-2 w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white z-20">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemHistory;
// import React from "react";
// // Import more specific icons for better visual representation
// import { FaCalendar, FaLocationDot, FaUserTie, FaBoxOpen, FaClipboardCheck } from "react-icons/fa6";
// import { FaCheckCircle, FaExclamationTriangle, FaWpforms, FaCloudUploadAlt, FaWarehouse, FaTruck, FaMapMarkerAlt, FaFileAlt, FaDolly, FaTools, FaArrowDown } from "react-icons/fa";
// import { FaTruckLoading } from "react-icons/fa";
// import { RiRouterFill } from "react-icons/ri";
// import { MdEditDocument } from "react-icons/md";
// import { PackageX, Clock, Package } from "lucide-react";

// const ItemHistory = ({ data = [], maxWidth = "max-w-4xl" }) => {
//   if (!Array.isArray(data) || data.length === 0) return null;

//   // --- Phase/Stage Configuration ---
//   const phaseConfig = {
//     // Stage accent colors, Icon for the Phase Header, and a descriptive title
//     "PO Initiated": { color: "border-cyan-500 text-cyan-500", icon: FaWpforms, title: "Purchase Order Initiated" },
//     "Inspection": { color: "border-blue-500 text-blue-500", icon: FaClipboardCheck, title: "PO Inspection" },
//     "PDF Uploaded": { color: "border-teal-500 text-teal-500", icon: FaFileAlt, title: "Documentation" },
//     "Refill": { color: "border-teal-500 text-teal-500", icon: MdEditDocument, title: "Re-Fill" },
//     "PO Approved": { color: "border-blue-500 text-blue-500", icon: FaCheckCircle, title: "PO Approved" },
//     "Store": { color: "border-purple-500 text-purple-500", icon: FaWarehouse, title: "Store Management" },
//     "Site": { color: "border-green-500 text-green-500", icon: FaMapMarkerAlt, title: "Site Deployment" },
//     "Spare": { color: "border-yellow-500 text-yellow-500", icon: FaTools, title: "OEM Spare" },
//     "Item Dispatched": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
//     "Item Received": { color: "border-green-500 text-green-500", icon: FaTruckLoading, title: "Item Receipt" },
//     "Live": { color: "border-purple-500 text-purple-500", icon: RiRouterFill, title: "Active/Live" },
//     "Dispatch": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
//     "RMA Generated": { color: "border-red-500 text-red-500", icon: PackageX, title: "RMA" },
//     "Dispatch Initiated": { color: "border-teal-500 text-teal-500", icon: FaTruck, title: "Dispatch & Shipping" },
//     //"Item Received": { color: "border-green-500 text-green-500", icon: FaTruckLoading, title: "Shipment Back" },
//     "Default": { color: "border-gray-500 text-gray-500", icon: FaBoxOpen, title: "Unknown Phase" },
//   };

//   // --- Status Configuration ---
//   const statusDetails = {
//     // Status badge colors and associated icons for individual steps
//     "PO Initiated": { color: "bg-blue-100 text-blue-800", icon: FaWpforms, description: "Purchase Order has been Initiated and sent to 'sender_username'" },
//     "Inspection in Progress": { color: "bg-yellow-100 text-yellow-800", icon: FaClipboardCheck, description: "Serial Number has been submitted for Inspection, " },
//     "Inspection Report Submitted": { color: "bg-teal-100 text-teal-800", icon: FaCloudUploadAlt, description: "Inspection Report has been submitted" },
//     "Inspection Approved": { color: "bg-green-100 text-green-800", icon: FaCheckCircle, description: "Inspection has been approved" },
//     // Dispatches
//     "Item Dispatched from Vendor": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective store/site." },
//     "Item Dispatched from Store": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective site." },
//     "Item Dispatched from Site": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) needs acceptance from respective Spare/Live." },
//     "Item Dispatched from OEM Spare": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) dispatched to respective store/site." },
//     "Item Dispatched from Live": { color: "bg-teal-100 text-teal-800", icon: FaTruck, description: "Item(s) dispatched to respective store/site." },
//     // Received
//     "Item Received at Store": { color: "bg-green-100 text-green-800", icon: FaDolly },
//     "Item Received at Site": { color: "bg-green-100 text-green-800", icon: FaTruckLoading },
//     // Spare and Live
//     "Item Received at OEM Spare": { color: "bg-green-100 text-green-800", icon: FaWarehouse },
//     "Item Received at Live": { color: "bg-green-100 text-green-800", icon: RiRouterFill },
//     // Rejected
//     "Item Rejected at Store": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
//     "Item Rejected at Site": { color: "bg-red-100 text-red-800", icon: FaExclamationTriangle },
//     // RMA
//     "RMA Generated": { color: "bg-purple-100 text-purple-800", icon: Clock },
//     "Dispatch Initiated": { color: "bg-teal-100 text-teal-800", icon: Package },
//     "Item Received": { color: "bg-green-100 text-green-800", icon: FaDolly },
//     // Other
//     "Default": { color: "bg-gray-100 text-gray-800", icon: FaBoxOpen },
//   };

//   // --- Grouping Logic (Kept as is - it's already good) ---
//   const sortedData = [...data].sort((a, b) => {
//     const ta = Date.parse(a?.created_at) || 0;
//     const tb = Date.parse(b?.created_at) || 0;
//     return ta - tb;
//   });

//   const groups = [];
//   let currentPhase = null;
//   let currentItems = [];

//   for (const item of sortedData) {
//     const phase = item?.phase ?? "Default";
//     if (phase === currentPhase) {
//       currentItems.push(item);
//     } else {
//       if (currentItems.length) {
//         groups.push({ phase: currentPhase, items: currentItems });
//       }
//       currentPhase = phase;
//       currentItems = [item];
//     }
//   }
//   if (currentItems.length) groups.push({ phase: currentPhase, items: currentItems });

//   const entries = groups;

//   // ------------------------------------------------------------------------------

//   return (
//     <div className={`w-full ${maxWidth} mx-auto max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-50`}>
//       <div className="flex flex-col items-center space-y-10 p-6">
//         {entries.map(({ phase: stage, items }, phaseIdx) => {
//           const phaseInfo = phaseConfig[stage] || phaseConfig["Default"];
//           const PhaseIcon = phaseInfo.icon;

//           return (
//             <React.Fragment key={`${stage}-${phaseIdx}`}>
//               {/* Phase Header / Milestone Card */}
//               <div
//                 className={`relative w-full bg-white border-l-8 ${phaseInfo.color.split(' ')[0]} p-4 pl-8 rounded-3xl shadow-2xl hover:shadow-xl transition-shadow duration-300`}
//               >
//                 {/* Milestone Icon */}
//                 <div className={`absolute -left-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full border-4 ${phaseInfo.color.split(' ')[0]} shadow-md`}>
//                   <PhaseIcon className={`text-2xl ${phaseInfo.color.split(' ')[1]}`} />
//                 </div>

//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-wider">{phaseInfo.title}</h3>
//                   <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length} step{items.length > 1 ? "s" : ""}</span>
//                 </div>

//                 <div className="space-y-4 pt-4 border-t border-gray-200 mt-2">
//                   {items.map((item, itemIdx) => {
//                     const statusInfo = statusDetails[item.item_status] || statusDetails["Default"];
//                     const StatusIcon = statusInfo.icon;
//                     const isEven = itemIdx % 2 === 0;

//                     // Improved visual separation for steps
//                     return (
//                       <div
//                         key={item.tracking_id ?? `${phaseIdx}-${itemIdx}`}
//                         className={`relative p-4 rounded-xl transition-all duration-150 ${isEven ? "bg-gray-50 border-r-4 border-dashed border-gray-200 hover:bg-gray-100" : "bg-white border-l-4 border-dashed border-gray-200 hover:bg-gray-50"
//                           }`}
//                       >
//                         <div className="flex flex-col">
//                           {/* Status Badge */}
//                           <div className="flex items-center text-sm font-bold mb-2">
//                             <StatusIcon className={`mr-2 text-xl ${statusInfo.color.split(' ')[1]}`} />
//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
//                               {item.item_status}
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
//                             {/* Date/Time */}
//                             <div className="flex items-center">
//                               <FaCalendar className="mr-2 text-gray-500 text-base" />
//                               <span className="font-medium">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</span>
//                             </div>

//                             {/* User/Receiver */}
//                             {item.receiver_user_name && (
//                               <div className="flex items-center">
//                                 <FaUserTie className="mr-2 text-gray-500 text-base" />
//                                 <span className="truncate" title={item.sender_user_name}>{item.sender_user_name}</span>
//                               </div>
//                             )}

//                             {/* Location */}
//                             {item.item_location && (
//                               <div className="flex items-center">
//                                 <FaLocationDot className="mr-2 text-gray-500 text-base" />
//                                 <span className="truncate" title={item.item_location}>{item.item_location}</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Phase Separator */}
//               {phaseIdx < entries.length - 1 && (
//                 <FaArrowDown className="text-gray-400 text-4xl my-4 animate-bounce" />
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ItemHistory;