// src/components/lineItemCard.jsx
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import AsyncSelect from "react-select/async";
import { useToast } from "../context/toastProvider.jsx"; // Ensure this path is correct
import api from "../api/apiCall.js"; // Import api here
import { FaFilter } from 'react-icons/fa';
import { commonSelectProps } from '../utils/CommonCSS.jsx';
import LocationOwnerSelect from '../dump/asyncSelectLocationOwner.jsx';
import ItemCard from './itemsCard.jsx';

const loadOptions = async (url, inputValue) => {
  return await api.get(url, { params: { search: inputValue } })
    .then(res => res.data.data.map(item => ({ value: item.id, label: item.name })))
    .catch(err => {
      console.error('Error loading options:', url, err);
      return [];
    });
};

const LineItemCard = ({
  lineItemName,
  lineItemId,
  details, // This is the array of items for this specific line item
  itemData,
  setItemData,
  flattenedItems, // Pass flattenedItems if needed for toggle_all (though details is preferred now)
  phaseConfig,
  isSpareLivePhase,
}) => {
  const addToast = useToast();
  const filterRef = useRef(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterRows, setFilterRows] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // State to manage collapsed state for this specific card
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Calculate counts based on current itemData state
  const counts = useMemo(() => {
    let selectedCount = 0;
    if (phaseConfig.showStore) {
      selectedCount += details.filter(item => itemData.stores.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)).length;
    }
    if (phaseConfig.showSite) {
      selectedCount += details.filter(item => itemData.sites.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)).length;
    }
    if (phaseConfig.showSpare) {
      selectedCount += details.filter(item => itemData.spares.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)).length;
    }
    if (phaseConfig.showLive) {
      selectedCount += details.filter(item => itemData.lives.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)).length;
    }
    return {
      totalItems: details.length,
      selectedCount
    };
  }, [details, itemData, phaseConfig]);

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Toggle checkbox logic (moved from parent)
  const toggleCheckbox = useCallback((type, detailId, selectAction = 'toggle') => {
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
      // Create shallow copies of the arrays
      const newStores = [...prev.stores];
      const newSites = [...prev.sites];
      const newSpares = [...prev.spares];
      const newLives = [...prev.lives];

      // --- CORRECTED LOGIC FOR SINGLE ITEM TOGGLE ---
      if (selectAction === 'toggle') {
        if (type === 'store') {
          // Clear other types for this *specific item*
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle store selection for this item
          const exists = prev.stores.some(s => s.po_line_item_id === lineItemId && s.po_item_details_id === detailId);
          if (exists) {
            const filteredStores = newStores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            newStores.splice(0, newStores.length, ...filteredStores);
          } else {
            newStores.push({ po_line_item_id: lineItemId, po_item_details_id: detailId, store_id: null, store_incharge_user_id: null });
          }
        } else if (type === 'site') {
          // Clear other types for this *specific item*
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle site selection for this item
          const exists = prev.sites.some(d => d.po_line_item_id === lineItemId && d.po_item_details_id === detailId);
          if (exists) {
            const filteredSites = newSites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newSites.splice(0, newSites.length, ...filteredSites);
          } else {
            newSites.push({ po_line_item_id: lineItemId, po_item_details_id: detailId, site_id: null, site_incharge_user_id: null });
          }
        } else if (type === 'spare') {
          // Clear other types for this *specific item*
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle spare selection for this item
          const exists = prev.spares.some(s => s.po_line_item_id === lineItemId && s.po_item_details_id === detailId);
          if (exists) {
            const filteredSpares = newSpares.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            newSpares.splice(0, newSpares.length, ...filteredSpares);
          } else {
            newSpares.push({ po_line_item_id: lineItemId, po_item_details_id: detailId });
          }
        } else if (type === 'live') {
          // Clear other types for this *specific item*
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          // Toggle live selection for this item
          const exists = prev.lives.some(d => d.po_line_item_id === lineItemId && d.po_item_details_id === detailId);
          if (exists) {
            const filteredLives = newLives.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
            newLives.splice(0, newLives.length, ...filteredLives);
          } else {
            newLives.push({ po_line_item_id: lineItemId, po_item_details_id: detailId });
          }
        }
        return { stores: newStores, sites: newSites, spares: newSpares, lives: newLives };
      }

      // --- CORRECTED LOGIC FOR TOGGLE ALL (specific to this card's details) ---
      if (selectAction === 'toggle_all') {
        const itemsToToggle = details; // Use details from this specific card
        const allSelected = itemsToToggle.every(item =>
          (type === 'store' ? newStores :
            type === 'site' ? newSites :
              type === 'spare' ? newSpares : newLives)
            .some(e => e.po_line_item_id === item.po_line_item_id && e.po_item_details_id === item.po_item_details_id)
        );

        if (type === 'store') {
          // Clear other types for all items in this card
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle store selection for all items in this card
          const filteredStores = newStores.filter(s => !itemsToToggle.some(item =>
            s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
          ));
          newStores.splice(0, newStores.length, ...filteredStores);

          if (!allSelected) {
            const defaultEntry = { store_id: null, store_incharge_user_id: null };
            const newStoreEntries = itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              ...defaultEntry
            }));
            newStores.push(...newStoreEntries);
          }
        } else if (type === 'site') {
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle site selection for all items in this card
          const filteredSites = newSites.filter(d => !itemsToToggle.some(item =>
            d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
          ));
          newSites.splice(0, newSites.length, ...filteredSites);

          if (!allSelected) {
            const defaultEntry = { site_id: null, site_incharge_user_id: null };
            const newSiteEntries = itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
              ...defaultEntry
            }));
            newSites.push(...newSiteEntries);
          }
        } else if (type === 'spare') {
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showLive) {
            const filteredLives = newLives.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredLives.length !== newLives.length) {
              newLives.splice(0, newLives.length, ...filteredLives);
            }
          }
          // Toggle spare selection for all items in this card
          const filteredSpares = newSpares.filter(s => !itemsToToggle.some(item =>
            s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
          ));
          newSpares.splice(0, newSpares.length, ...filteredSpares);

          if (!allSelected) {
            const newSpareEntries = itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
            }));
            newSpares.push(...newSpareEntries);
          }
        } else if (type === 'live') {
          if (phaseConfig.showStore) {
            const filteredStores = newStores.filter(s => !itemsToToggle.some(item =>
              s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id
            ));
            if (filteredStores.length !== newStores.length) {
              newStores.splice(0, newStores.length, ...filteredStores);
            }
          }
          if (phaseConfig.showSite) {
            const filteredSites = newSites.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSites.length !== newSites.length) {
              newSites.splice(0, newSites.length, ...filteredSites);
            }
          }
          if (phaseConfig.showSpare) {
            const filteredSpares = newSpares.filter(d => !itemsToToggle.some(item =>
              d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
            ));
            if (filteredSpares.length !== newSpares.length) {
              newSpares.splice(0, newSpares.length, ...filteredSpares);
            }
          }
          const filteredLives = newLives.filter(d => !itemsToToggle.some(item =>
            d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id
          ));
          newLives.splice(0, newLives.length, ...filteredLives);

          if (!allSelected) {
            const newLiveEntries = itemsToToggle.map(item => ({
              po_line_item_id: item.po_line_item_id,
              po_item_details_id: item.po_item_details_id,
            }));
            newLives.push(...newLiveEntries);
          }
        }
        return { stores: newStores, sites: newSites, spares: newSpares, lives: newLives };
      }
      return prev;
    });
  }, [phaseConfig, lineItemId, setItemData]);

  // Handle select change logic (moved from parent)
  const handleSelectChange = useCallback((group, field, detailId) => {
    return (option) => {
      setItemData(prev => {
        const newGroup = [...prev[group]];
        const index = newGroup.findIndex(entry =>
          entry.po_line_item_id === lineItemId && entry.po_item_details_id === detailId
        );

        if (index !== -1) {
          newGroup[index] = { ...newGroup[index], [field]: option };
          return { ...prev, [group]: newGroup };
        }
        return prev;
      });
    };
  }, [lineItemId, setItemData]);

  // Optimized handleBulkSelectChange
  const handleBulkSelectChange = useCallback((group, field) => {
    return (option) => {
      setItemData(prev => {
        const newGroup = [...prev[group]];
        let hasChanges = false;

        for (let i = 0; i < newGroup.length; i++) {
          // Only update items that don't already have a value for this field
          // AND are part of the current line item
          if (newGroup[i].po_line_item_id === lineItemId &&
            (newGroup[i][field] === null || newGroup[i][field] === undefined)) {
            newGroup[i] = { ...newGroup[i], [field]: option };
            hasChanges = true;
          }
        }

        if (hasChanges) {
          return { ...prev, [group]: newGroup };
        }
        return prev;
      });
    };
  }, [lineItemId, setItemData]);

  const selectionStates = useMemo(() => {
    const isAnyItemSelected = itemData.stores.some(item => item.po_line_item_id === lineItemId) ||
      itemData.sites.some(item => item.po_line_item_id === lineItemId);

    const hasUnassignedStoreItems = itemData.stores.some(item =>
      item.po_line_item_id === lineItemId &&
      (item.store_id === null || item.store_id === undefined || item.store_incharge_user_id === null || item.store_incharge_user_id === undefined)
    );

    const hasUnassignedSiteItems = itemData.sites.some(item =>
      item.po_line_item_id === lineItemId &&
      (item.site_id === null || item.site_id === undefined || item.site_incharge_user_id === null || item.site_incharge_user_id === undefined)
    );
    const allStoreSelected = details.every(item =>
      itemData.stores.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)
    );
    const allSiteSelected = details.every(item =>
      itemData.sites.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)
    );
    const allSpareSelected = details.every(item =>
      itemData.spares.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id)
    );
    const allLiveSelected = details.every(item =>
      itemData.lives.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id)
    );

    return {
      isAnyItemSelected,
      hasUnassignedStoreItems,
      hasUnassignedSiteItems,
      allStoreSelected,
      allSiteSelected,
      allSpareSelected,
      allLiveSelected
    };
  }, [itemData, lineItemId, details]);

  const totalColumns = isSpareLivePhase ? 11 : 9;

  // isEnabled helper (moved from parent)
  const isEnabled = (thisStatus, phase) => {
    return thisStatus === "Inspection Approved" ||
      thisStatus === "Item Received at Store" ||
      thisStatus === "Item Received at Site" ||
      thisStatus === "Item Rejected at Store" ||
      thisStatus === "Item Rejected at Site" ||
      thisStatus === "Item in Spare Inventory" ||
      thisStatus === "Item Commissioned";
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
      }
    };
    if (openFilter) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openFilter]);

  // Replace the existing useEffect with:
  useEffect(() => {
    if (selectionStates.isAnyItemSelected &&
      (selectionStates.hasUnassignedStoreItems || selectionStates.hasUnassignedSiteItems)) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectionStates.isAnyItemSelected, selectionStates.hasUnassignedStoreItems, selectionStates.hasUnassignedSiteItems]);

  return (
    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-lg">
      {/* --- Collapsible Header Row --- */}
      <div
        className="flex justify-between items-center mb-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100"
        onClick={toggleCollapse}
      >
        <h2 className="text-xl font-bold text-gray-700">{lineItemName}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            ({counts.selectedCount} of {counts.totalItems} Selected)
          </span>
          <FaFilter onClick={() => console.log('Filter')} className="text-gray-900 hover:bg-gray-300 rounded-full p-1 h-6 w-6" />
          <span className="text-lg">{isCollapsed ? '▶' : '▼'}</span>
        </div>
      </div>
      {openFilter && (
        <div ref={filterRef} className="absolute right-0 mt-2 w-full min-w-[400px] max-h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-y-auto">
          <div className="p-4 space-y-4">
            {filterRows.map(row => (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <div className="flex-1">
                  <Select
                    options={[{ value: 'store', label: 'Store' }, { value: 'site', label: 'Site' }, { value: 'spare', label: 'Spare' }, { value: 'live', label: 'Live' }]}
                    placeholder="Field"
                    value={[{ value: row.field, label: row.field }]}
                    onChange={(e) => console.log(e.value)}
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                {/* <button
                  onClick={() => removeFilterRow(row.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button> */}
              </div>
            ))}

            {/* <button
              onClick={addFilterRow}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add Filter</span>
            </button> */}
          </div>
        </div>
      )}
      {showBulkActions && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 max-w-4xl w-full mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Location & owner for selected items.
            </span>
            <div className="flex gap-2 flex-wrap">
              {selectionStates.hasUnassignedStoreItems && (
                <div className="flex gap-2">
                  <LocationOwnerSelect
                    storeSelect={true}
                    siteSelect={false}
                    addToast={addToast}
                    itemData={itemData}
                    lineItemId={lineItemId}
                    onChange={handleBulkSelectChange}
                  />
                </div>
              )}
              {selectionStates.hasUnassignedSiteItems && (
                <div className="flex gap-2">
                  <LocationOwnerSelect
                    storeSelect={false}
                    siteSelect={true}
                    addToast={addToast}
                    itemData={itemData}
                    lineItemId={lineItemId}
                    onChange={handleBulkSelectChange}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  // Clear all selections for this line item
                  setItemData(prev => {
                    const newStores = prev.stores.filter(s => s.po_line_item_id !== lineItemId);
                    const newSites = prev.sites.filter(s => s.po_line_item_id !== lineItemId);
                    const newSpares = prev.spares.filter(s => s.po_line_item_id !== lineItemId);
                    const newLives = prev.lives.filter(s => s.po_line_item_id !== lineItemId);
                    return { stores: newStores, sites: newSites, spares: newSpares, lives: newLives };
                  });
                }}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
              >
                Cut All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Content (Items) --- */}
      {!isCollapsed && (
        <>
          {/* --- Header Row for Large Screens (Hidden on Small) --- */}
          <div className={`hidden sm:grid gap-2 text-sm font-semibold text-gray-500 mb-3 px-3 py-2 bg-white rounded-lg border border-gray-100`}
            style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
            {phaseConfig.showStore && (
              <span className="flex justify-center items-center sm:col-span-1">
                <input
                  type="checkbox"
                  checked={selectionStates.allStoreSelected}
                  onChange={() => toggleCheckbox('store', null, 'toggle_all')}
                  className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />Store
              </span>
            )}
            {phaseConfig.showSite && (
              <span className="flex justify-center items-center sm:col-span-1">
                <input
                  type="checkbox"
                  checked={selectionStates.allSiteSelected}
                  onChange={() => toggleCheckbox('site', null, 'toggle_all')}
                  className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />Site
              </span>
            )}
            {phaseConfig.showSpare && (
              <span className="flex justify-center items-center sm:col-span-1">
                <input
                  type="checkbox"
                  checked={selectionStates.allSpareSelected}
                  onChange={() => toggleCheckbox('spare', null, 'toggle_all')}
                  className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />Spare
              </span>
            )}
            {phaseConfig.showLive && (
              <span className="flex justify-center items-center sm:col-span-1">
                <input
                  type="checkbox"
                  checked={selectionStates.allLiveSelected}
                  onChange={() => toggleCheckbox('live', null, 'toggle_all')}
                  className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />Live
              </span>
            )}
            <span className="sm:col-span-3">Item Description</span>
            <span className="sm:col-span-2">Location</span>
            <span className="sm:col-span-2">Owner</span>
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
                      checked={selectionStates.allStoreSelected}
                      onChange={() => toggleCheckbox('store', null, 'toggle_all')}
                      className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                    />Store
                  </label>
                )}
                {phaseConfig.showSite && (
                  <label className="flex items-center ml-2">
                    <input
                      type="checkbox"
                      checked={selectionStates.allSiteSelected}
                      onChange={() => toggleCheckbox('site', null, 'toggle_all')}
                      className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                    />Site
                  </label>
                )}
                {phaseConfig.showSpare && (
                  <label className="flex items-center ml-2">
                    <input
                      type="checkbox"
                      checked={selectionStates.allSpareSelected}
                      onChange={() => toggleCheckbox('spare', null, 'toggle_all')}
                      className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                    />Spare
                  </label>
                )}
                {phaseConfig.showLive && (
                  <label className="flex items-center ml-2">
                    <input
                      type="checkbox"
                      checked={selectionStates.allSpareSelected}
                      onChange={() => toggleCheckbox('live', null, 'toggle_all')}
                      className="mr-1 h-3 w-3 text-blue-600 border-gray-300 rounded"
                    />Live
                  </label>
                )}
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {details.map(item => {
              return (
                <ItemCard
                  key={item.po_item_details_id}
                  item={item}
                  itemData={itemData}
                  isEnabled={isEnabled}
                  phaseConfig={phaseConfig}
                  isSpareLivePhase={isSpareLivePhase}
                  toggleCheckbox={toggleCheckbox}
                  handleSelectChange={handleSelectChange}
                />
              );
            })}
          </ul>
        </>
      )}
      {/* bulk location, owner selection */}
      {/* {(selectionStates.hasUnassignedStoreItems || selectionStates.hasUnassignedSiteItems) && (
        <LocationOwnerSelect
          storeSelect={selectionStates.hasUnassignedStoreItems}
          siteSelect={selectionStates.hasUnassignedSiteItems}
          addToast={addToast}
          itemData={itemData}
          lineItemId={lineItemId}
          onChange={handleBulkSelectChange}
        />
      )} */}
      {showBulkActions && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 max-w-4xl w-full mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Location & owner for selected items.
            </span>
            <div className="flex gap-2 flex-wrap">
              {selectionStates.hasUnassignedStoreItems && (
                <div className="flex gap-2">
                  <LocationOwnerSelect
                    storeSelect={true}
                    siteSelect={false}
                    addToast={addToast}
                    itemData={itemData}
                    lineItemId={lineItemId}
                    onChange={handleBulkSelectChange}
                  />
                </div>
              )}
              {selectionStates.hasUnassignedSiteItems && (
                <div className="flex gap-2">
                  <LocationOwnerSelect
                    storeSelect={false}
                    siteSelect={true}
                    addToast={addToast}
                    itemData={itemData}
                    lineItemId={lineItemId}
                    onChange={handleBulkSelectChange}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  // Clear all selections for this line item
                  setItemData(prev => {
                    const newStores = prev.stores.filter(s => s.po_line_item_id !== lineItemId);
                    const newSites = prev.sites.filter(s => s.po_line_item_id !== lineItemId);
                    const newSpares = prev.spares.filter(s => s.po_line_item_id !== lineItemId);
                    const newLives = prev.lives.filter(s => s.po_line_item_id !== lineItemId);
                    return { stores: newStores, sites: newSites, spares: newSpares, lives: newLives };
                  });
                }}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
              >
                Cut All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LineItemCard;