import { useEffect, useState, useMemo } from "react";
import api from "../api/apiCall.js";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/toastProvider.jsx";
import { ContentLoading } from "../globalLoading.jsx";
import ReactModal from "react-modal";
import { downloadPDF } from "../utils/downloadResponsePdf.js";
import ReadMore from "../utils/readMore.jsx";
import LineItemCard from "../components/lineItemCard.jsx"; // Adjust path as necessary

const DispatchItemsModal = ({ isOpen, onClose, onModalSubmit, po_id = null, po_line_item_id, line_item_name, po_item_details_id, phaseName }) => {
  const [poDetails, setPoDetails] = useState({});
  const [flattenedItems, setFlattenedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const addToast = useToast();
  const [itemData, setItemData] = useState({
    stores: [],
    sites: [],
    spares: [],
    lives: []
  });
  const [showError, setShowError] = useState(false);

  // --- Determine checkboxes based on phaseName ---
  const phaseConfig = useMemo(() => {
    switch (phaseName) {
      case "At Store":
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
      case "On Site":
        return { showStore: true, showSite: true, showSpare: true, showLive: true };
      case "Live":
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
      case "OEM Spare":
        return { showStore: true, showSpare: false, showLive: true, showSite: true };
      case "Approve PO":
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
      default:
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
    }
  }, [phaseName]);

  // Determine if phase is one where spare/live options are available (for column calculation)
  const isSpareLivePhase = useMemo(() => {
    return phaseConfig.showSpare || phaseConfig.showLive;
  }, [phaseConfig]);

  // Determine if phase is Approve PO (where spare/live should not be available)
  const isInspectionPhase = useMemo(() => {
    return phaseName === "Approve PO";
  }, [phaseName]);

  const isOnSite = useMemo(() => {
    return phaseName === "On Site";
  }, [phaseName]);

  const isAtStore = useMemo(() => {
    return phaseName === "At Store";
  }, [phaseName]);

  useEffect(() => {
    if (!isOpen) {
      setLoading(true);
      setPoDetails({});
      setFlattenedItems([]);
      setItemData({ stores: [], sites: [], spares: [], lives: [] });
      setShowError(false);
    }

    if (isOpen && po_id) {
      const thisPhase = phaseName === 'At Store' ? 'Store' : phaseName === 'On Site' ? 'Site' : phaseName === 'OEM Spare' ? 'Spare' : phaseName === 'Live' ? 'Live' : 'Inspection';
      Promise.all([
        api.get(`/api/fullPoDataForDispatch/${po_id}`, { params: { phase: thisPhase } }),
      ])
        .then(([itemsResponse]) => {
          const rawData = itemsResponse.data.data;
          let allItemDetails = [];
          let po_number = rawData.po_number;
          let po_description = rawData.po_description;

          if (po_id && rawData && Array.isArray(rawData.po_line_items)) {
            allItemDetails = rawData.po_line_items.flatMap(lineItem =>
              lineItem.po_item_details.map(detail => ({
                ...detail,
                po_line_item_id: lineItem.po_line_item_id,
                line_item_name: lineItem.line_item_name,
                phase: lineItem.phases // Include phase from line item
              }))
            );
          } else if (Array.isArray(rawData)) {
            allItemDetails = rawData;
          } else if (rawData && typeof rawData === 'object') {
            allItemDetails = [{
              ...rawData,
              po_line_item_id: rawData.po_line_item_id || po_line_item_id,
              line_item_name: rawData.line_item_name || line_item_name,
              phase: rawData.phases // Include phase from line item
            }];
          } else {
            console.error('Unexpected data structure for items:', rawData);
          }

          setPoDetails({ po_number, po_description });
          setFlattenedItems(allItemDetails);
        })
        .catch(err => {
          console.error(err);
          addToast(err);
        }).finally(() => {
          setLoading(false);
        })
    }
  }, [po_line_item_id, po_item_details_id, phaseName, isInspectionPhase, isOpen, addToast, po_id, isOnSite, isAtStore]);

  // Group items
  const groupedItems = useMemo(() => {
    const map = new Map();
    flattenedItems.forEach(item => {
      if (!map.has(item.po_line_item_id)) {
        map.set(item.po_line_item_id, {
          lineItemName: item.line_item_name,
          phase: item.phase,
          details: []
        });
      }
      map.get(item.po_line_item_id).details.push(item);
    });
    return Array.from(map.values());
  }, [flattenedItems]);

  

  // --- Validation Logic (Syntax Fixed) ---
  const isFormValid = useMemo(() => {
    const selectedItemsCount = itemData.stores.length + itemData.sites.length + itemData.spares.length + itemData.lives.length;
    if (selectedItemsCount === 0) return false;

    const hasStoreItems = itemData.stores.length > 0;
    const hasSiteItems = itemData.sites.length > 0;

    if (hasStoreItems) {
      const allStoreItemsValid = itemData.stores.every(storeItem => {
        return storeItem.store_id && storeItem.store_incharge_user_id;
      });
      if (!allStoreItemsValid) return false;
    }
    if (hasSiteItems) {
      const allSiteItemsValid = itemData.sites.every(siteItem => {
        return siteItem.site_id && siteItem.site_incharge_user_id;
      });
      if (!allSiteItemsValid) return false;
    }
    // If we reach here, validation passed for all selected items. Now check if *any* items were selected.
    return true;
  }, [itemData]);

  const handleSubmit = () => {
    setSubmitLoading(true);
    if (!isFormValid) {
      setShowError(true);
      // Scroll to error message if needed
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setSubmitLoading(false);
      return;
    }
    const thisDispatchLocation = phaseName === 'At Store' ? 'store' : phaseName === 'On Site' ? 'site' : phaseName === 'OEM Spare' ? 'spare' : phaseName === 'Approve PO' ? 'inspection' : phaseName.toLowerCase();
    const submitData = {
      ...itemData,
      stores: itemData.stores.map(s => ({
        ...s,
        store_id: s.store_id ? s.store_id.value : null,
        store_incharge_user_id: s.store_incharge_user_id ? s.store_incharge_user_id.value : null
      })),
      sites: itemData.sites.map(s => ({
        ...s,
        site_id: s.site_id ? s.site_id.value : null,
        site_incharge_user_id: s.site_incharge_user_id ? s.site_incharge_user_id.value : null
      })),
      po_id,
      dispatch_from: thisDispatchLocation
    };
    api.post('/api/operation-store-dispatch', submitData)
      .then(res => {
        const data = res.data;
        addToast({
          response: { statusText: data.message || 'Item/s Dispatched!' },
          type: 'success',
          status: '200'
        });
        if (data.dispatch_report_url) {
          downloadPDF(data.dispatch_report_url, 'Dispatch_Report.pdf');
        }
        if (data.live_report_url) {
          downloadPDF(data.live_report_url, 'Live_Report.pdf');
        }
        onModalSubmit();
        onClose();
      })
      .catch(err => {
        addToast(err);
        onClose();
      }).finally(() => {
        setSubmitLoading(false)
      });
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
    >
      {loading ? (<ContentLoading />)
        : (
          // **CORRECTION HERE**
          /* Main modal body: Flex column with constrained height */
          <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative transform transition-all duration-300 flex flex-col max-h-[90vh]">

            {/* Header Area - Fixed (flex-shrink-0) */}
            <div className="p-4 sm:px-8 sm:py-4 pb-0 flex-shrink-0">
              <button
                className="absolute top-4 right-4 text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-xl transition"
                onClick={onClose}
                aria-label="Close modal"
              >
                &times;
              </button>
              <div className="mb-2 border-b pb-2">
                <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-800">
                  Dispatch Item(s)
                </h3>
                <p className="text-lg font-medium text-blue-600">{poDetails.po_number}</p>
                <ReadMore text={poDetails.po_description} lines={1} className="text-sm text-gray-500 mt-1" />
              </div>
            </div>

            {/* Scrollable Line Items Content Area - Fixed height and overflow-y-auto */}
            <div className="px-4 sm:px-8 flex-grow overflow-y-auto min-h-0">
              {groupedItems.length > 0 ? (
                groupedItems.map((group) => {
                  const lineItemId = group.details[0]?.po_line_item_id;
                  return (
                    <LineItemCard
                      key={lineItemId}
                      lineItemName={group.lineItemName}
                      lineItemId={lineItemId}
                      details={group.details}
                      itemData={itemData}
                      setItemData={setItemData} // Pass the setter function down
                      flattenedItems={flattenedItems} // Pass flattened items if needed for toggle_all
                      phaseConfig={phaseConfig}
                      isSpareLivePhase={isSpareLivePhase}
                    />
                  );
                })
              ) : (
                <div className="text-center p-12 rounded-lg bg-green-50">
                  <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-semibold text-green-800">No Pending Items</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    All items in this PO for the **{phaseName}** phase have been actioned.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Area - Fixed */}
            <div className="px-4 sm:px-8 pt-4 pb-4 sm:pb-8 border-t flex flex-col sm:flex-row justify-between items-center flex-shrink-0">
              <div className={`text-sm font-medium mb-3 sm:mb-0 error-message ${showError ? 'text-red-600' : 'text-transparent'}`}>
                {showError ? '⚠️ Please fill/select all items before submitting.' : "\u00A0"}
              </div>
              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition duration-150 ease-in-out"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${submitLoading ? 'loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={!isFormValid || submitLoading}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )
      }
    </ReactModal >
  );
};

export default DispatchItemsModal;