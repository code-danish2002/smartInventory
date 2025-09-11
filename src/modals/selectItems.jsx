import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import api from "../api/apiCall.js";
import { useAuth } from "../context/authContext.jsx";
import { useToast } from "../context/toastProvider.jsx";
import GlobalLoading from "../globalLoading.jsx";
import ReactModal from "react-modal";

const SelectItemsModal = ({ isOpen, onClose, onModalSubmit, po_line_item_id, line_item_name, po_item_details_id }) => {
  const { name } = useAuth();
  const [poData, setPoData] = useState({});
  const [loading, setLoading] = useState(true);
  const groups = Object.entries(poData).filter(([_, v]) => Array.isArray(v));
  const addToast = useToast();
  const [itemData, setItemData] = useState({
    stores: [],
    sites: []
  });
  const [showError, setShowError] = useState(false);

  const [options, setOptions] = useState({
    store_id: [{ value: 5, label: 'Ernakulam' }],
    store_incharge_user_id: {},
    site_id: [],
    site_incharge_user_id: []
  });
  //console.log('selectItems -->>', po_line_item_id, po_item_details_id);

  useEffect(() => {
    Promise.all([
      api.get(`${po_line_item_id ? `/api/allPoItemDataByLineItemId/${po_line_item_id}` : `/api/items/${po_item_details_id}`}`,),
      api.get('/api/store'),
      api.get('/api/user-details/grouped-by-pop'),
    ])
      .then(([poRes, storesRes, popRes,]) => {
        //console.log('selectItems -->>', typeof poRes.data.data, poRes.data.data, popRes);
        const raw = poRes.data.data;

        // If it's already an array use it, otherwise wrap it in one
        const itemsArray = Array.isArray(poRes.data.data)
          ? poRes.data.data
          : [poRes.data];   // ← put the single object into an array

        const groupedPoData = itemsArray.reduce((acc, item) => {
          const type = item.item_type_name || 'Uncategorized'; // Use a default if type is missing
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(item);
          return acc;
        }, {});
        setPoData(groupedPoData);

        // stores
        const storeIds = storesRes?.data?.data?.map(s => ({ value: s.store_id, label: s.store_name }));
        const incharges = {};
        storesRes?.data?.data?.forEach(s => {
          console.log('store', s);
          incharges[s.store_id] = s.store_incharges.map(ic => ({ value: ic.user_id, label: ic.user_name }));
        });

        // pops
        const popIds = popRes?.data?.data.map(p => ({ value: p.pop_id, label: p.pop_name }));
        const popReceivers = {};
        popRes?.data?.data.forEach(p => {
          popReceivers[p.pop_id] = p.receiver?.map(r => ({ value: r.user_id, label: r.user_name }));
        });
        setOptions({
          store_id: storeIds,
          store_incharge_user_id: incharges,
          site_id: popIds,
          site_incharge_user_id: popReceivers
        });
        setLoading(false);
      })
      .catch(err => { console.error(err); addToast(err); setLoading(false); });
  }, [po_line_item_id, po_item_details_id]);

  // const getSenderID = () =>
  //   api.get(`/api/user-details-by-name/${name}`)
  //     .then(res => res.data.data.user_id);

  const toggleCheckbox = async (type, lineItemId, detailId) => {
    if (type === 'store') {
      setItemData(prev => {
        // remove any dispatch on this item
        const newDispatches = prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId));
        // toggle store entry
        const exists = prev.stores.some(s => s.po_line_item_id === lineItemId && s.po_item_details_id === detailId);
        const newStores = exists
          ? prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId))
          : [...prev.stores, { po_line_item_id: lineItemId, po_item_details_id: detailId, store_id: null, store_incharge_user_id: null }];
        return { stores: newStores, sites: newDispatches };
      });
    } else {
      setItemData(prev => {
        // remove any store on this item
        const newStores = prev.stores.filter(s => !(s.po_line_item_id === lineItemId && s.po_item_details_id === detailId));
        // toggle dispatch entry
        const exists = prev.sites.some(d => d.po_line_item_id === lineItemId && d.po_item_details_id === detailId);
        const newDispatches = exists
          ? prev.sites.filter(d => !(d.po_line_item_id === lineItemId && d.po_item_details_id === detailId))
          : [...prev.sites, { po_line_item_id: lineItemId, po_item_details_id: detailId, site_id: null, site_incharge_user_id: null }];
        return { stores: newStores, sites: newDispatches };
      });
    }
  };

  const handleSelectChange = (group, field, lineItemId, detailId) => option => {
    setItemData(prev => ({
      ...prev,
      [group]: prev[group].map(entry =>
        entry.po_line_item_id === lineItemId && entry.po_item_details_id === detailId
          ? { ...entry, [field]: option ? option.value : null }
          : entry
      )
    }));
  };

  // Validate all items
  const allSelected = useMemo(() => {
    return groups.flatMap(([, items]) => items).every(item => {
      const storeEntry = itemData.stores.find(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id);
      if (storeEntry) return storeEntry.store_id && storeEntry.store_incharge_user_id;
      const dispatchEntry = itemData.sites.find(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id);
      if (dispatchEntry) return dispatchEntry.site_id && dispatchEntry.site_incharge_user_id;
      return false;
    });
  }, [itemData, groups]);

  const handleSubmit = () => {
    console.log('Submitting itemData:', itemData);
    if (!allSelected) {
      setShowError(true);
      return;
    }
    api.post('/api/operation-store-dispatch', itemData)
      .then(res => { addToast(res); onModalSubmit(); onClose(); })
      .catch(err => { addToast(err); onClose(); });
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

  console.log('groups', groups, typeof groups);
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
          <div className="bg-white w-full max-w-5xl max-h-full overflow-auto rounded-lg shadow-lg p-6 relative">
            <button className="absolute top-4 right-4 text-xl" onClick={onClose}>✕</button>
            <h1 className="text-2xl font-semibold mb-6">Dispatch Item/s</h1>

            {groups.length > 0 ? (
              groups.map(([_, items]) => (
                <div key={items[0]?.po_line_item_id} className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">{line_item_name}</h2>
                  {/* Table header for larger screens */}
                  <div className="hidden sm:grid sm:grid-cols-9 gap-2 text-sm font-medium text-gray-500 mb-2">
                    <span className="col-span-1 justify-self-center">Store</span>
                    <span className="col-span-1 justify-self-center">Site</span>
                    <span className="col-span-3">Item Description</span>
                    <span className="col-span-2">Location</span>
                    <span className="col-span-2">Owner</span>
                  </div>

                  <ul className="space-y-2">
                    {items.map(item => {
                      const isStore = itemData.stores.some(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id);
                      const isDispatch = itemData.sites.some(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id);
                      const storeEntry = itemData.stores.find(s => s.po_line_item_id === item.po_line_item_id && s.po_item_details_id === item.po_item_details_id) || {};
                      const dispatchEntry = itemData.sites.find(d => d.po_line_item_id === item.po_line_item_id && d.po_item_details_id === item.po_item_details_id) || {};

                      return (
                        <li key={item.po_item_details_id} className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center p-3 bg-gray-50 rounded-md">
                          <label className="flex justify-center items-center col-span-1">
                            <span className="font-medium sm:hidden">Store</span>
                            <input
                              type="checkbox"
                              checked={isStore}
                              onChange={() => toggleCheckbox('store', item.po_line_item_id, item.po_item_details_id)}
                            />
                          </label>
                          <label className="flex justify-center items-center col-span-1">
                            <span className="font-medium sm:hidden">Dispatch</span>
                            <input
                              type="checkbox"
                              checked={isDispatch}
                              onChange={() => toggleCheckbox('dispatch', item.po_line_item_id, item.po_item_details_id)}
                            />
                          </label>
                          <div className="col-span-3">
                            <div className="text-sm font-medium">SN: {item.item_serial_number} | {item.item_part_description}</div>
                            <div className="text-xs text-gray-500">{item.item_type_name} | {item.item_make_name} | {item.item_model_name}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium sm:hidden">Location</span>
                            <Select
                              options={isStore ? options.store_id : options.site_id}
                              isClearable
                              isDisabled={!isStore && !isDispatch}
                              placeholder={isStore ? "Select Store" : "Select POP"}
                              value={isStore
                                ? options.store_id.find(o => o.value === storeEntry.store_id) || null
                                : options.site_id.find(o => o.value === dispatchEntry.site_id) || null
                              }
                              onChange={handleSelectChange(isStore ? 'stores' : 'sites', isStore ? 'store_id' : 'site_id', item.po_line_item_id, item.po_item_details_id)}
                              {...commonSelectProps}
                            />
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium sm:hidden">Owner</span>
                            <Select
                              options={isStore
                                ? options.store_incharge_user_id[storeEntry.store_id] || []
                                : options.site_incharge_user_id[dispatchEntry.site_id] || []
                              }
                              isClearable
                              isDisabled={isStore
                                ? !storeEntry.store_id
                                : !dispatchEntry.site_id
                              }
                              placeholder={isStore ? "Select Store Incharge" : "Select Receiver"}
                              value={isStore
                                ? (options.store_incharge_user_id[storeEntry.store_id] || []).find(o => o.value === storeEntry.store_incharge_user_id) || null
                                : (options.site_incharge_user_id[dispatchEntry.site_id] || []).find(o => o.value === dispatchEntry.site_incharge_user_id) || null
                              }
                              onChange={handleSelectChange(isStore ? 'stores' : 'sites', isStore ? 'store_incharge_user_id' : 'site_incharge_user_id', item.po_line_item_id, item.po_item_details_id)}
                              {...commonSelectProps}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))) : (
              <div className="text-center text-gray-500 font-semibold mt-4 mb-6">No items available for selection.</div>
            )}


            <div className="text-red-500 mb-4 text-center">
              {showError ? 'Please fill/select all items before submitting.' : "\u00A0"}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md" onClick={onClose}>Cancel</button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}
    </ReactModal>
  );
};

export default SelectItemsModal;