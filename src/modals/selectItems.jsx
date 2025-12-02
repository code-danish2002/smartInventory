import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import api from "../api/apiCall.js";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/toastProvider.jsx";
import GlobalLoading from "../globalLoading.jsx";
import ReactModal from "react-modal";
import { downloadPDF } from "../utils/downloadResponsePdf.js";
import ReadMore from "../utils/readMore.jsx";
import AsyncSelect from "react-select/async";

const SelectItemsModal = ({ isOpen, onClose, onModalSubmit, po_id = null, po_line_item_id, line_item_name, po_item_details_id, phaseName }) => {
  const { name } = useAuth();
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

  // --- NEW: Determine checkboxes based on phaseName ---
  const phaseConfig = useMemo(() => {
    switch (phaseName) {
      case "At Store":
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
      case "On Site":
        return { showStore: true, showSite: true, showSpare: true, showLive: true };
      case "Live":
        return { showStore: true, showSite: true, showSpare: false, showLive: false };
      case "OEM Spare":
        return { showStore: true, showSpare: false, showLive: true, showSite: true }; // Assuming Inventory doesn't need Site dispatch
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
  }, [po_line_item_id, po_item_details_id, phaseName, isInspectionPhase, isOpen, addToast, po_id, isOnSite, isAtStore]);

  // NEW:
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

  const isEnabled = (thisStatus, phase) => {
    return thisStatus === "Inspection Approved" ||
      thisStatus === "Item Received at Store" ||
      thisStatus === "Item Received at Site" ||
      thisStatus === "Item Rejected at Store" ||
      thisStatus === "Item Rejected at Site" ||
      thisStatus === "Item in Spare Inventory" ||
      thisStatus === "Item Commissioned";
  };

  const toggleCheckbox = (type, lineItemId, detailId, selectAction = 'toggle') => {
    // Ensure only allowed types for the current phase can be selected
    if (
      (type === 'spare' && !phaseConfig.showSpare) ||
      (type === 'live' && !phaseConfig.showLive) ||
      (type === 'store' && !phaseConfig.showStore) ||
      (type === 'site' && !phaseConfig.showSite)
    ) {
      return; // Ignore if type is not allowed for this phase
    }

    setItemData(prev => {
      let newStores = [...prev.stores];
      let newSites = [...prev.sites];
      let newSpares = [...prev.spares];
      let newLives = [...prev.lives];
      const itemsToToggle = flattenedItems.filter(item => item.po_line_item_id === lineItemId);

      if (selectAction === 'toggle_all') {
        const allSelected = itemsToToggle.every(item =>
          (type === 'store' ? newStores :
            type === 'site' ? newSites :
              type === 'spare' ? newSpares : newLives)
            .some(e => e.po_line_item_id === item.po_line_item_id && e.po_item_details_id === item.po_item_details_id)
        );

        if (type === 'store') {
          if (phaseConfig.showSite) {
            newSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showSpare) {
            newSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showLive) {
            newLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          // Toggle store selection
          newStores = newStores.filter(s => !itemsToToggle.some(item =>
            s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
          ));
          if (!allSelected) {
            const defaultEntry = { store_id: null, store_incharge_user_id: null };
            newStores = [...newStores, ...itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              ...defaultEntry
            }))];
          }
        } else if (type === 'site') {
          // Clear other types that are allowed for this phase
          if (phaseConfig.showStore) {
            newStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showSpare) {
            newSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showLive) {
            newLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          // Toggle site selection
          newSites = newSites.filter(d => !itemsToToggle.some(item =>
            d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
          ));
          if (!allSelected) {
            const defaultEntry = { site_id: null, site_incharge_user_id: null };
            newSites = [...newSites, ...itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              ...defaultEntry
            }))];
          }
        } else if (type === 'spare') {
          // Clear other types that are allowed for this phase
          if (phaseConfig.showStore) {
            newStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showSite) {
            newSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showLive) {
            newLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          // Toggle spare selection
          newSpares = newSpares.filter(s => !itemsToToggle.some(item =>
            s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
          ));
          if (!allSelected) {
            newSpares = [...newSpares, ...itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              // No location or owner fields needed
            }))];
          }
        } else if (type === 'live') {
          // Clear other types that are allowed for this phase
          if (phaseConfig.showStore) {
            newStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showSite) {
            newSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          if (phaseConfig.showSpare) {
            newSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
          }
          // Toggle live selection
          newLives = newLives.filter(d => !itemsToToggle.some(item =>
            d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
          ));
          if (!allSelected) {
            newLives = [...newLives, ...itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              // No location or owner fields needed
            }))];
          }
        }
        return { stores: newStores, sites: newSites, spares: newSpares, lives: newLives };
      } else {
        // Single item toggle logic
        if (type === 'store') {
          if (phaseConfig.showSite) {
            const updatedSites = prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSites = updatedSites;
          }
          if (phaseConfig.showSpare) {
            const updatedSpares = prev.spares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSpares = updatedSpares;
          }
          if (phaseConfig.showLive) {
            const updatedLives = prev.lives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newLives = updatedLives;
          }
          const exists = prev.stores.some(s => s.po_line_item_id === lineItemId && s.po_item_details_id === detailId);
          const updatedStores = exists
            ? prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId))
            : [...prev.stores, { po_line_item_id: lineItemId, po_item_details_id: detailId, store_id: null, store_incharge_user_id: null }];
          return { stores: updatedStores, sites: newSites, spares: newSpares, lives: newLives };
        } else if (type === 'site') {
          if (phaseConfig.showStore) {
            const updatedStores = prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            newStores = updatedStores;
          }
          if (phaseConfig.showSpare) {
            const updatedSpares = prev.spares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSpares = updatedSpares;
          }
          if (phaseConfig.showLive) {
            const updatedLives = prev.lives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newLives = updatedLives;
          }
          const exists = prev.sites.some(d => d.po_line_item_id === lineItemId && d.po_item_details_id === detailId);
          const updatedSites = exists
            ? prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId))
            : [...prev.sites, { po_line_item_id: lineItemId, po_item_details_id: detailId, site_id: null, site_incharge_user_id: null }];
          return { stores: newStores, sites: updatedSites, spares: newSpares, lives: newLives };
        } else if (type === 'spare') {
          if (phaseConfig.showStore) {
            const updatedStores = prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            newStores = updatedStores;
          }
          if (phaseConfig.showSite) {
            const updatedSites = prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSites = updatedSites;
          }
          if (phaseConfig.showLive) {
            const updatedLives = prev.lives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newLives = updatedLives;
          }
          const exists = prev.spares.some(s => s.po_line_item_id === lineItemId && s.po_item_details_id === detailId);
          const updatedSpares = exists
            ? prev.spares.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId))
            : [...prev.spares, { po_line_item_id: lineItemId, po_item_details_id: detailId }];
          return { stores: newStores, sites: newSites, spares: updatedSpares, lives: newLives };
        } else if (type === 'live') {
          if (phaseConfig.showStore) {
            const updatedStores = prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            newStores = updatedStores;
          }
          if (phaseConfig.showSite) {
            const updatedSites = prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSites = updatedSites;
          }
          if (phaseConfig.showSpare) {
            const updatedSpares = prev.spares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSpares = updatedSpares;
          }
          const exists = prev.lives.some(d => d.po_line_item_id === lineItemId && d.po_item_details_id === detailId);
          const updatedLives = exists
            ? prev.lives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId))
            : [...prev.lives, { po_line_item_id: lineItemId, po_item_details_id: detailId }];
          return { stores: newStores, sites: newSites, spares: newSpares, lives: updatedLives };
        }
      }
    });
  };

  const handleSelectChange = (group, field, lineItemId, detailId) => async (option) => {
    console.log('Selected option:', option, field);
    setItemData(prev => ({
      ...prev,
      [group]: prev[group].map(entry =>
        entry.po_line_item_id === lineItemId && entry.po_item_details_id === detailId
          ? { ...entry, [field]: option }
          : entry
      )
    }));
  };

  // --- Validation Logic ---
  const isFormValid = useMemo(() => {
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
      return;
    }
    const thisDispatchLocation = phaseName === 'At Store' ? 'store': phaseName === 'On Site' ? 'site' : phaseName === 'OEM Spare' ? 'spare' : phaseName === 'Approve PO'? 'inspection' : phaseName.toLowerCase();
    const submitData = {
      ...itemData,
      stores: itemData.stores.map(s => ({
        ...s,
        store_id: s.store_id ? s.store_id.value : null, // Extract ID from stored option object
        store_incharge_user_id: s.store_incharge_user_id ? s.store_incharge_user_id.value : null // Extract ID from stored option object
      })),
      sites: itemData.sites.map(s => ({
        ...s,
        site_id: s.site_id ? s.site_id.value : null, // Extract ID from stored option object
        site_incharge_user_id: s.site_incharge_user_id ? s.site_incharge_user_id.value : null // Extract ID from stored option object
      })),
      po_id,
      dispatch_from: thisDispatchLocation
    };
    api.post('/api/operation-store-dispatch', submitData)
      .then(res => {
        const data = res.data;
        // Handle success message
        addToast({
          response: { statusText: data.message || 'Item/s Dispatched!' },
          type: 'success',
          status: '200'
        });
        // If a dispatch report URL exists, download it
        if (data.dispatch_report_url) {
          downloadPDF(data.dispatch_report_url, 'Dispatch_Report.pdf');
          // window.open(response.data.report_url, '_blank'); // Fixed variable name
        }
        // If a live report URL exists, download it as well (optional)
        if (data.live_report_url) {
          downloadPDF(data.live_report_url, 'Live_Report.pdf');
          // window.open(response.data.report_url, '_blank'); // Fixed variable name
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

  const commonSelectProps = {
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'absolute',
    styles: {
      menuPortal: base => ({ ...base, zIndex: 10000 }),
      control: base => ({ ...base, minHeight: '42px', maxHeight: '65px', overflowY: 'auto' }),
      valueContainer: base => ({ ...base, maxHeight: '65px', overflowY: 'auto' }),
      menu: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
      menuList: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 })
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
    >
      {loading ? (<GlobalLoading message="Loading PO Data..." />)
        : (
          // Change max-w-6xl to max-w-5xl
          <div className="bg-white w-full max-w-6xl max-h-full overflow-auto rounded-xl shadow-2xl p-4 sm:p-8 relative transform transition-all duration-300">
            <div className="">
            <button
              className="absolute top-4 right-4 text-gray-500 px-3 py-1 rounded-lg hover:text-gray-700 hover:bg-gray-200 text-xl transition"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="mb-6 border-b pb-4">
              <h3 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-800">
                Dispatch Item(s)
              </h3>
              <p className="text-lg font-medium text-blue-600">{poDetails.po_number}</p>
              <ReadMore text={poDetails.po_description} lines={1} className="text-sm text-gray-500 mt-1" />
            </div>
            </div>
            {groupedItems.length > 0 ? (
              groupedItems.map((group) => {
                const lineItemId = group.details[0]?.po_line_item_id;
                // Determine the state for the "Select All" checkboxes
                const allStoreSelected = group.details.every(item =>
                  itemData.stores.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)
                );
                const allSiteSelected = group.details.every(item =>
                  itemData.sites.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)
                );
                const allSpareSelected = group.details.every(item =>
                  itemData.spares.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)
                );
                const allLiveSelected = group.details.every(item =>
                  itemData.lives.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)
                );
                // Calculate number of columns based on phase for header (Original logic)
                const totalColumns = isSpareLivePhase ? 11 : 9;
                return (
                  <div key={group.details[0]?.po_line_item_id} className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">{group.lineItemName}</h2>
                    {/* --- Header Row for Large Screens (Hidden on Small) --- */}
                    <div className={`hidden sm:grid gap-2 text-sm font-semibold text-gray-500 mb-3 px-3 py-2 bg-white rounded-lg border border-gray-100`}
                      style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
                      {phaseConfig.showStore && (
                        <span className="flex justify-center items-center sm:col-span-1">
                          <input
                            type="checkbox"
                            checked={allStoreSelected}
                            onChange={() => toggleCheckbox('store', lineItemId, null, 'toggle_all')}
                            className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />Store
                        </span>
                      )}
                      {phaseConfig.showSite && (
                        <span className="flex justify-center items-center sm:col-span-1">
                          <input
                            type="checkbox"
                            checked={allSiteSelected}
                            onChange={() => toggleCheckbox('site', lineItemId, null, 'toggle_all')}
                            className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />Site
                        </span>
                      )}
                      {phaseConfig.showSpare && (
                        <span className="flex justify-center items-center sm:col-span-1">
                          <input
                            type="checkbox"
                            checked={allSpareSelected}
                            onChange={() => toggleCheckbox('spare', lineItemId, null, 'toggle_all')}
                            className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />Spare
                        </span>
                      )}
                      {phaseConfig.showLive && (
                        <span className="flex justify-center items-center sm:col-span-1">
                          <input
                            type="checkbox"
                            checked={allLiveSelected}
                            onChange={() => toggleCheckbox('live', lineItemId, null, 'toggle_all')}
                            className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />Live
                        </span>
                      )}
                      {/* Adjusted spans for headers (Original logic) */}
                      <span className={isSpareLivePhase ? "sm:col-span-3" : "sm:col-span-3"}>Item Description</span>
                      <span className={isSpareLivePhase ? "sm:col-span-2" : "sm:col-span-2"}>Location</span>
                      <span className={isSpareLivePhase ? "sm:col-span-2" : "sm:col-span-2"}>Owner</span>
                    </div>

                    {/* --- Header Row for Small Screens (Visible only on Small) --- */}
                    <div className="sm:hidden grid grid-cols-1 gap-2 text-xs font-semibold text-gray-500 mb-2 px-3 py-1 bg-white rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span>Select All</span>
                        <div className="flex space-x-2">
                          {phaseConfig.showStore && (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={allStoreSelected}
                                onChange={() => toggleCheckbox('store', lineItemId, null, 'toggle_all')}
                                className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                              />Store
                            </label>
                          )}
                          {phaseConfig.showSite && (
                            <label className="flex items-center ml-2">
                              <input
                                type="checkbox"
                                checked={allSiteSelected}
                                onChange={() => toggleCheckbox('site', lineItemId, null, 'toggle_all')}
                                className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                              />Site
                            </label>
                          )}
                          {phaseConfig.showSpare && (
                            <label className="flex items-center ml-2">
                              <input
                                type="checkbox"
                                checked={allSpareSelected}
                                onChange={() => toggleCheckbox('spare', lineItemId, null, 'toggle_all')}
                                className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                              />Spare
                            </label>
                          )}
                          {phaseConfig.showLive && (
                            <label className="flex items-center ml-2">
                              <input
                                type="checkbox"
                                checked={allLiveSelected}
                                onChange={() => toggleCheckbox('live', lineItemId, null, 'toggle_all')}
                                className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                              />Live
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {group.details.map(item => {
                        const isStore = itemData.stores.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id);
                        const isSite = itemData.sites.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id);
                        const isSpare = itemData.spares.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id);
                        const isLive = itemData.lives.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id);

                        const storeEntry = itemData.stores.find(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id) || {};
                        const dispatchEntry = itemData.sites.find(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id) || {};
                        const spareEntry = itemData.spares.find(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id) || {};
                        const liveEntry = itemData.lives.find(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id) || {};
                        const thisEnabled = isEnabled(item.po_item_status, item.phase);

                        return (
                          <li key={item.po_item_details_id}
                            className={`grid gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm
                                          sm:items-center sm:p-3 sm:shadow-none
                                          ${isSpareLivePhase ? 'sm:grid-cols-11' : 'sm:grid-cols-9'}`}>

                            {thisEnabled ? (
                              <>
                                {/* --- Checkboxes for Small Screens --- */}
                                <div className="sm:hidden grid grid-cols-4 gap-2">
                                  {phaseConfig.showStore && (
                                    <label className="flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={isStore}
                                        onChange={() => toggleCheckbox('store', item.po_line_item_id, item.po_item_details_id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                      <span>Store</span>
                                    </label>
                                  )}
                                  {phaseConfig.showSite && (
                                    <label className="flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={isSite}
                                        onChange={() => toggleCheckbox('site', item.po_line_item_id, item.po_item_details_id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                      <span>Site</span>
                                    </label>
                                  )}
                                  {phaseConfig.showSpare && (
                                    <label className="flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={isSpare}
                                        onChange={() => toggleCheckbox('spare', item.po_line_item_id, item.po_item_details_id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                      <span>Spare</span>
                                    </label>
                                  )}
                                  {phaseConfig.showLive && (
                                    <label className="flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                      <input
                                        type="checkbox"
                                        checked={isLive}
                                        onChange={() => toggleCheckbox('live', item.po_line_item_id, item.po_item_details_id)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                      <span>Live</span>
                                    </label>
                                  )}
                                </div>
                                {/* --- Checkboxes for Large Screens --- */}
                                {phaseConfig.showStore && (
                                  <label className="hidden sm:flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={isStore}
                                      onChange={() => toggleCheckbox('store', item.po_line_item_id, item.po_item_details_id)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span>Store</span>
                                  </label>
                                )}
                                {phaseConfig.showSite && (
                                  <label className="hidden sm:flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={isSite}
                                      onChange={() => toggleCheckbox('site', item.po_line_item_id, item.po_item_details_id)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span>Site</span>
                                  </label>
                                )}
                                {phaseConfig.showSpare && (
                                  <label className="hidden sm:flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={isSpare}
                                      onChange={() => toggleCheckbox('spare', item.po_line_item_id, item.po_item_details_id)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span>Spare</span>
                                  </label>
                                )}
                                {phaseConfig.showLive && (
                                  <label className="hidden sm:flex justify-center items-center space-x-1 text-sm font-medium text-gray-700">
                                    <input
                                      type="checkbox"
                                      checked={isLive}
                                      onChange={() => toggleCheckbox('live', item.po_line_item_id, item.po_item_details_id)}
                                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span>Live</span>
                                  </label>
                                )}
                              </>
                            ) : (
                              <span className="text-sm font-bold text-red-500 sm:text-gray-500 sm:font-medium col-span-2">{item.po_item_status}</span>
                            )}

                            {/* Item Description - spans 3 columns on larger screens, full width on small */}
                            <div className={`sm:col-span-3 ${thisEnabled ? '' : 'col-span-full sm:col-span-3'}`}>
                              <div className="text-sm font-medium">SN: {item.item_serial_number} | {item.item_part_description}</div>
                              <div className="text-xs text-gray-500">{item.item_type_name} | {item.item_make_name} | {item.item_model_name}</div>
                            </div>

                            {/* Location - spans 2 columns on larger screens, full width on small */}
                            {thisEnabled ? (
                              <div className={`sm:col-span-2`}>
                                <span className="font-medium sm:hidden">Location</span>
                                <AsyncSelect
                                  cacheOptions
                                  loadOptions={async (inputValue) => {
                                    if (inputValue.length <= 2) {
                                      return Promise.resolve([]);
                                    }
                                    if (isStore) {
                                      return api.get('/api/stores/searchByStoreName', { params: { search: inputValue } })
                                        .then(response => response.data.data.map(s => ({ value: s.store_id, label: s.store_name })))
                                        .catch(err => {addToast(err); return Promise.resolve([]);});
                                    } else if (isSite) {
                                      return api.get('/api/pops/searchByPopName', { params: { search: inputValue } })
                                        .then(response => response.data.data.map(p => ({ value: p.pop_id, label: p.pop_name })))
                                        .catch(err => {addToast(err); return Promise.resolve([]);});
                                    } else {
                                      return Promise.resolve([]);
                                    }
                                  }}
                                  isClearable
                                  isDisabled={!(isStore || isSite)}
                                  placeholder={
                                    isStore ?  'Type Store Name' :
                                      isSite ? 'Type POP Name':
                                        (isSpare || isLive) ? 'Not Required' : 'Choose Phase'
                                  }
                                  value={isStore ? storeEntry.store_id : isSite ? dispatchEntry.site_id : null}
                                  onChange={async (option) => {
                                    handleSelectChange(
                                      isStore ? 'stores' : 'sites',
                                        isStore ? 'store_id' : 'site_id',
                                      item.po_line_item_id,
                                      item.po_item_details_id
                                    )(option); // Pass the option to the original handler
                                  }}
                                  {...commonSelectProps}
                                  styles={{
                                    ...commonSelectProps.styles,
                                    control: (base) => ({
                                      ...base,
                                      backgroundColor: !(isStore || isSite) ? '#f3f4f6' : base.backgroundColor,
                                      cursor: !(isStore || isSite) ? 'not-allowed' : base.cursor,
                                      minHeight: '42px',
                                      maxHeight: '65px',
                                      overflowY: 'auto'
                                    }),
                                    option: (base) => ({
                                      ...base,
                                      cursor: !(isStore || isSite) ? 'not-allowed' : base.cursor
                                    })
                                  }}
                                />
                              </div>
                            ) : (
                              <span className={`sm:col-span-2 text-gray-500 font-medium`}>
                                {item.item_location}
                              </span>
                            )}

                            {/* Owner - spans 2 columns on larger screens, full width on small - FIXED */}
                            {thisEnabled ? (
                              <div className={`sm:col-span-2`}> {/* Ensure 2 column span */}
                                <span className="font-medium sm:hidden">Owner</span>
                                <AsyncSelect
                                  cacheOptions
                                  loadOptions={async (inputValue) => {
                                    const selectedLocationId = isStore ? (storeEntry.store_id ? storeEntry.store_id.value : null) : isSite ? (dispatchEntry.site_id ? dispatchEntry.site_id.value : null) : isSpare ? (spareEntry.store_id ? spareEntry.store_id.value : null) : (liveEntry.site_id ? liveEntry.site_id.value : null);
                                    if (!selectedLocationId) {
                                      return Promise.resolve([]);
                                    }
                                    if (inputValue.length <= 2) {
                                      return Promise.resolve([]);
                                    }
                                    return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
                                      .then(response => response.data.data.map(u => ({ value: u.user_id, label: u.user_name })))
                                      .catch(err => { addToast(err); return Promise.resolve([]); });
                                  }}
                                  isClearable
                                  isDisabled={
                                    isStore ? !storeEntry.store_id :
                                      isSite ? !dispatchEntry.site_id :
                                        isSpare ? !spareEntry.store_id : !liveEntry.site_id
                                  }
                                  placeholder={
                                    isStore ? "Type Incharge Name":
                                      isSite ? "Type Receiver Name" :
                                        (isSpare || isLive) ? "Not Required" : "Choose Phase"
                                  }
                                  value={isStore ? storeEntry.store_incharge_user_id : isSite ? dispatchEntry.site_incharge_user_id : null}
                                  onChange={handleSelectChange(
                                    isStore ? 'stores' :
                                      isSite ? 'sites' :
                                        isSpare ? 'spares' : 'lives',
                                    isStore || isSpare ? 'store_incharge_user_id' : 'site_incharge_user_id',
                                    item.po_line_item_id,
                                    item.po_item_details_id
                                  )}
                                  {...commonSelectProps}
                                  styles={{
                                    ...commonSelectProps.styles,
                                    control: (base) => ({
                                      ...base,
                                      backgroundColor: (
                                        isStore ? !storeEntry.store_id :
                                          isSite ? !dispatchEntry.site_id :
                                            isSpare ? !spareEntry.store_id : !liveEntry.site_id
                                      ) ? '#f3f4f6' : base.backgroundColor,
                                      cursor: (
                                        isStore ? !storeEntry.store_id :
                                          isSite ? !dispatchEntry.site_id :
                                            isSpare ? !spareEntry.store_id : !liveEntry.site_id
                                      ) ? 'not-allowed' : base.cursor,
                                      minHeight: '42px',
                                      maxHeight: '65px',
                                      overflowY: 'auto'
                                    }),
                                    option: (base) => ({
                                      ...base,
                                      cursor: (
                                        isStore ? !storeEntry.store_id :
                                          isSite ? !dispatchEntry.site_id :
                                            isSpare ? !spareEntry.store_id : !liveEntry.site_id
                                      ) ? 'not-allowed' : base.cursor
                                    })
                                  }}
                                />
                              </div>
                            ) : (
                              <span className={`sm:col-span-2 text-gray-500 font-medium`}> {/* Ensure 2 column span */}
                                {item.last_owner}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              })) : (
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
            {/* Error and Footer Buttons */}
            <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row justify-between items-center">
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
                  disabled={!isFormValid || submitLoading} // --- Enable validation ---
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
    </ReactModal>
  );
};

export default SelectItemsModal;