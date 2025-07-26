import React, { useState, useMemo } from "react";
import { MyInput } from "../elements";
import api from "../apiCall";

const POCard = ({ po }) => {
  const [openMain, setOpenMain] = useState(false);
  const [openItems, setOpenItems] = useState({});
  const [loadingItems, setLoadingItems] = useState(true);

  const toggleMain = () => setOpenMain((v) => !v);
  const toggleItem = (idx) => setOpenItems((prev) => ({ ...prev, [idx]: !prev[idx] }));

  async function getItems(po_id, lineItemId) {
    await api.get(`/pos/${po_id}/line-items/${lineItemId}/details`).then((res) => {
        return res.data.data
    }).catch((err) => {
        console.log(err)
        return [{message: 'No Items found'}]
    }).finally(() => {
        setLoadingItems(false)
    })
  }

  return (
    <div className="self-start bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-4 flex flex-col h-96">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-blue-700">{po.po_number}</h3>
          <div className="text-xs text-gray-500">ID: {po.po_id}</div>
        </div>
        <button
          onClick={toggleMain}
          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 focus:outline-none"
        >
          {openMain ? "Hide" : "Details"}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {/* Main Details */}
        {openMain && (
          <div className="space-y-1">
            <div><span className="font-medium text-gray-700">Firm:</span> {po.firm_name} (ID: {po.firm_id})</div>
            <div><span className="font-medium text-gray-700">Tender:</span> {po.tender_number}</div>
            <div><span className="font-medium text-gray-700">Issue Date:</span> {po.date_of_issue}</div>
            <div><span className="font-medium text-gray-700">Authority:</span> {po.inspection_authority_user_name}</div>
            <div><span className="font-medium text-gray-700">Last Updated:</span> {new Date(po.timedatestamp).toLocaleString()}</div>
            <div><span className="font-medium text-gray-700">Remarks:</span> {po.remarks || 'N/A'}</div>
          </div>
        )}

        {/* Line Items */}
        {po.lineItems.map((item, idx) => (
          <div key={idx} className="border rounded-lg">
            <div
              onClick={() => toggleItem(idx)}
              className="flex justify-between items-center p-2 bg-blue-50 cursor-pointer select-none"
            >
              <span className="font-medium text-blue-800 text-sm">{item.line_item_name}</span>
              <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
            </div>
            {openItems[idx] && (
              <div className="p-2 bg-white space-y-1">
                <div className="flex flex-wrap gap-2 text-sm">
                  <div><span className="text-gray-600">Qty:</span> <span className="font-semibold">{item.quantity}</span></div>
                  <div><span className="text-gray-600">Offered:</span> <span className="font-semibold">{item.quantity_offered}</span></div>
                  <div><span className="text-gray-600">Inspected:</span> <span className="font-semibold">{item.quantity_inspected}</span></div>
                </div>
                {item.details.map((d, di) => (
                  <div key={di} className="p-2 border rounded bg-gray-50 text-xs space-y-1">
                    <div><span className="text-gray-600">Serial:</span> <span className="font-semibold">{d.item_serial_number}</span></div>
                    <div><span className="text-gray-600">Type:</span> <span className="font-semibold">{d.item_type_name}</span></div>
                    <div><span className="text-gray-600">Make:</span> <span className="font-semibold">{d.item_make_name}</span></div>
                    <div><span className="text-gray-600">Model:</span> <span className="font-semibold">{d.item_model_name}</span></div>
                    <div><span className="text-gray-600">Part Code:</span> <span className="font-semibold">{d.item_part_code}</span></div>
                    <div><span className="text-gray-600">Desc:</span> <span className="font-semibold">{d.item_part_description}</span></div>
                    <div><span className="text-gray-600">Remarks:</span> <span className="font-semibold">{d.remarks || 'N/A'}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {po.lineItems.length === 0 && (
          <div className="text-gray-500 text-center text-xs py-2">No line items available.</div>
        )}
      </div>
    </div>
  );
};


const ShowPO = ({ apiData = [
    {
        "po_id": 108,
        "po_number": "ghmgf h",
        "firm_id": 1,
        "firm_name": "xyz firm",
        "tender_number": "ghmfgm",
        "date_of_issue": "2025-06-01",
        "inspection_authority_user_id": 2,
        "inspection_authority_user_name": "Aditya Kumar",
        "timedatestamp": "2025-07-28T00:00:00.000Z",
        "remarks": "",
        "lineItems": [
            {
                "line_item_name": "ghmgf",
                "quantity": 1,
                "quantity_offered": 1,
                "quantity_inspected": 1,
                "inspection_status": "Re-Fill",
                "details": []
            }
        ]
    },
    {
        "po_id": 111,
        "po_number": "PO900",
        "firm_id": 3,
        "firm_name": "Infosys",
        "tender_number": "TN9001",
        "date_of_issue": "2025-06-06",
        "inspection_authority_user_id": 8,
        "inspection_authority_user_name": "Danish Samir",
        "timedatestamp": "2025-06-24T08:39:20.000Z",
        "remarks": "",
        "lineItems": [
            {
                "line_item_name": "PLI9001",
                "quantity": 1,
                "quantity_offered": 1,
                "quantity_inspected": 1,
                "inspection_status": "Re-Fill",
                "details": [
                    {
                        "po_item_details_id": 59,
                        "item_serial_number": "SN9001",
                        "item_status": "Store",
                        "item_type_id": 1,
                        "item_make_id": 1,
                        "item_model_id": 1,
                        "item_part_id": 11,
                        "item_type_name": "Router",
                        "item_make_name": "Cisco",
                        "item_model_name": "Cisco RV340",
                        "item_part_code": "C1111-4P",
                        "item_part_description": "C1111-4P CISCO ISR 1100 4 PORTS DUAL GE WAN ETHERNET ROUTER",
                        "remarks": ""
                    }
                ]
            },
            {
                "line_item_name": "PLI90013",
                "quantity": 1,
                "quantity_offered": 1,
                "quantity_inspected": 1,
                "inspection_status": "Upload",
                "details": [
                    {
                        "po_item_details_id": 193,
                        "item_serial_number": "SN7945tuh34",
                        "item_status": "Upload",
                        "item_type_id": 1,
                        "item_make_id": 2,
                        "item_model_id": 2,
                        "item_part_id": 12,
                        "item_type_name": "Router",
                        "item_make_name": "Juniper",
                        "item_model_name": "Juniper SRX300",
                        "item_part_code": "2WFXO-RTM",
                        "item_part_description": "CTP2000 2WFXO rear transition module",
                        "remarks": ""
                    },
                    {
                        "po_item_details_id": 194,
                        "item_serial_number": "SN7945tuh34",
                        "item_status": "Re-Fill",
                        "item_type_id": 1,
                        "item_make_id": 2,
                        "item_model_id": 2,
                        "item_part_id": 12,
                        "item_type_name": "Router",
                        "item_make_name": "Juniper",
                        "item_model_name": "Juniper SRX300",
                        "item_part_code": "2WFXO-RTM",
                        "item_part_description": "CTP2000 2WFXO rear transition module",
                        "remarks": ""
                    }
                ]
            }
        ]
    },
    {
        "po_id": 112,
        "po_number": "PO901",
        "firm_id": 3,
        "firm_name": "Infosys",
        "tender_number": "TN9012",
        "date_of_issue": "2025-06-06",
        "inspection_authority_user_id": 8,
        "inspection_authority_user_name": "Danish Samir",
        "timedatestamp": "2025-06-24T08:39:20.000Z",
        "remarks": "",
        "lineItems": [
            {
                "line_item_name": "PLI9012",
                "quantity": 1,
                "quantity_offered": 1,
                "quantity_inspected": 1,
                "inspection_status": "Re-Fill",
                "details": [
                    {
                        "po_item_details_id": 193,
                        "item_serial_number": "SN7945tuh34",
                        "item_status": "Upload",
                        "item_type_id": 1,
                        "item_make_id": 2,
                        "item_model_id": 2,
                        "item_part_id": 12,
                        "item_type_name": "Router",
                        "item_make_name": "Juniper",
                        "item_model_name": "Juniper SRX300",
                        "item_part_code": "2WFXO-RTM",
                        "item_part_description": "CTP2000 2WFXO rear transition module",
                        "remarks": ""
                    }
                ]
            }
        ]
    },
    {
        "po_id": 113,
        "po_number": "PO902",
        "firm_id": 3,
        "firm_name": "Infosys",
        "tender_number": "TN9013",
        "date_of_issue": "2025-06-06",
        "inspection_authority_user_id": 8,
        "inspection_authority_user_name": "Danish Samir",
        "timedatestamp": "2025-06-24T08:39:20.000Z",
        "remarks": "",
        "lineItems": [
            {
                "line_item_name": "PLI9013",
                "quantity": 1,
                "quantity_offered": 1,
                "quantity_inspected": 1,
                "inspection_status": "Re-Fill",
                "details": [
                    {
                        "po_item_details_id": 194,
                        "item_serial_number": "SN7945tuh34",
                        "item_status": "Upload",
                        "item_type_id": 1,
                        "item_make_id": 2,
                        "item_model_id": 2,
                        "item_part_id": 12,
                        "item_type_name": "Router",
                        "item_make_name": "Juniper",
                        "item_model_name": "Juniper SRX300",
                        "item_part_code": "2WFXO-RTM",
                        "item_part_description": "CTP2000 2WFXO rear transition module",
                        "remarks": ""
                    }
                ]
            }
        ]
    }
] }) => {
    const [searchWord, setSearchWord] = useState("");

  const filteredData = useMemo(() => {
    if (!searchWord.trim()) return apiData;
    return apiData.filter((po) =>
      [po.po_number, po.firm_name, po.tender_number]
        .some((field) => field.toLowerCase().includes(searchWord.toLowerCase()))
    );
  }, [searchWord, apiData]);

  return (
    <div className="max-h-[90vh] overflow-y-auto p-4 space-y-6">
      {/* Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-blue-800">Purchase Orders</h2>
        <MyInput
          property={{
            name: "search",
            type: "text",
            placeholder: "Search by PO#, Firm or Tender",
            isDisabled: false,
            isRequired: false,
            element: "input",
          }}
          handleInputChange={setSearchWord}
          value={searchWord}
          className="w-full md:w-1/3"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.map((po) => (
          <POCard key={po.po_id} po={po} />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No Purchase Orders match your search.
        </div>
      )}
    </div>
  );
};

export default ShowPO;