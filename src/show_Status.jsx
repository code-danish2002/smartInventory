import React from "react";
import {
  FaCalendar,
  FaClipboardList,
  FaStore,
  FaTruck,
  FaWpforms,
} from "react-icons/fa";
import { FaLocationDot,  FaPersonCircleCheck } from "react-icons/fa6";

export const ShowStatus = ({ status = [] }) => {
  // 1. Define your display order and icons
  const steps = [
    { name: "Fill",       icon: <FaWpforms className="w-5 h-5" /> },
    { name: "Inspection", icon: <FaClipboardList className="w-5 h-5" /> },
    { name: "Store",      icon: <FaStore className="w-5 h-5" /> },
    { name: "Received",   icon: <FaTruck className="w-5 h-5" /> },
    //{ name: "",   icon: <RiUserReceived2Line className="w-5 h-5" /> },
  ];

  // 2. Map raw statuses to logical stage names
  const rawToStage = {
    Upload:      "Fill",
    Pending:     "Inspection",
    Approve:    "Inspection",
    Reject:      "Inspection",
    Waiting:     "Store",
    Stored:      "Store",
    "Rejected by Store": "Store",
    Dispatched:  "Received",
    Received:    "Received",
    "Rejected by Receiver": "Received",
  };

  // 3. Map raw statuses to a color class
  const rawToColor = (raw) => {
    if (["Reject", "Rejected", "Rejected by Store", "Rejected by Receiver"].includes(raw)) {
      return "bg-red-500 text-white";
    }
    if (["Approved", "Stored", "Received"].includes(raw)) {
      return "bg-green-500 text-white";
    }
    if (["Pending", "Waiting", "Dispatched", "Upload"].includes(raw)) {
      return "bg-yellow-300 text-yellow-800";
    }
    return "bg-gray-200 text-gray-500";
  };

  // 4. Group incoming items first by their mapped stage
  const stageMap = {};
  status.forEach(item => {
    const stage = rawToStage[item.status] || "Fill";
    if (!stageMap[stage]) stageMap[stage] = [];
    stageMap[stage].push(item);
  });

  // 5. Find the last completed step index (any item in that stage)
  const lastDoneIndex = steps
    .map(s => Boolean(stageMap[s.name]?.length))
    .lastIndexOf(true);

    console.log("Status:",status, 'stageMap:', stageMap, 'lastDoneIndex:', lastDoneIndex);
  return (
    <div className="w-full py-20 px-4 bg-gray-100 rounded-lg shadow-md">
      <div className="relative flex justify-between">
        {/* Progress line */}
        <div className="absolute top-4 left-10 right-10 h-1.5 bg-gray-200 z-0">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(lastDoneIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const isPast = idx < lastDoneIndex;
          const isCurrent = idx === lastDoneIndex;
          const items = stageMap[step.name] || [];
          console.log("Step:", step.name, 'isPast:', isPast, 'isCurrent:', isCurrent, 'items:', items);

          // Determine styling
          let circleClass = isPast
            ? "bg-green-500 text-white"
            : isCurrent && items.length
            ? rawToColor(items[items.length - 1].status)
            : "bg-gray-200 text-gray-500";

          return (
            <div key={step.name} className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div
                  className={`
                    flex items-center justify-center 
                    w-9 h-9 rounded-full
                    ${circleClass}
                    transition-all duration-300
                  `}
                >
                  {step.icon}
                </div>

                {/* Tooltip for past & current */}
                {(isPast || isCurrent) && items.length > 0 && (
                  <div className="
                    absolute top-full left-1/2 transform -translate-x-1/2 mt-2
                    bg-gray-800 text-white text-xs px-3 py-1 rounded-md
                    opacity-0 group-hover:opacity-100 transition-opacity
                    shadow-lg z-50 w-44
                  ">
                    <div className="grid grid-cols-3 gap-1">
                      <div className="col-span-3 font-medium text-center pb-1 border-b border-gray-600">
                        {step.name}
                      </div>
                      <div className="text-gray-300"><FaCalendar /></div>
                      <div className="col-span-2">{items[1]? items[1].created_at : items[0].created_at}</div>

                      <div className="text-gray-300"><FaLocationDot /></div>
                      <div className="col-span-2">{items[1]? items[1].user.user_location : items[0].user.user_location}</div>

                      <div className="text-gray-300">
                        <FaPersonCircleCheck className="w-5 h-5" />
                      </div>
                      <div className="col-span-2">{items[1]? items[1].user.user_name : items[0].user.user_name}</div>
                    </div>
                    <div className="
                      absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
                      w-0 h-0 border-l-4 border-r-4 border-b-4 border-gray-800
                      border-l-transparent border-r-transparent border-t-transparent
                    "/>
                  </div>
                )}
              </div>

              <div className="mt-2 text-center">
                <span className={`text-xs font-medium ${
                  isPast || isCurrent ? "text-green-700" : "text-gray-500"
                }`}>
                  {step.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
