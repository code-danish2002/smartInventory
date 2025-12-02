// src/components/ItemCard.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import { commonSelectProps } from "../utils/CommonCSS.jsx";
import api from "../api/apiCall.js";

const ItemCard = ({
    item,
    itemData,
    isEnabled,
    phaseConfig,
    isSpareLivePhase,
    toggleCheckbox,
    handleSelectChange,
}) => {

    const match = (entry) =>
        entry.po_line_item_id === item.po_line_item_id &&
        entry.po_item_details_id === item.po_item_details_id;

    const isStore = itemData.stores.some(match);
    const isSite = itemData.sites.some(match);
    const isSpare = itemData.spares.some(match);
    const isLive = itemData.lives.some(match);

    const storeEntry = itemData.stores.find(match) || {};
    const dispatchEntry = itemData.sites.find(match) || {};
    const spareEntry = itemData.spares.find(match) || {};
    const liveEntry = itemData.lives.find(match) || {};

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
                                    onChange={() => toggleCheckbox('store', item.po_item_details_id)}
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
                                    onChange={() => toggleCheckbox('site', item.po_item_details_id)}
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
                                    onChange={() => toggleCheckbox('spare', item.po_item_details_id)}
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
                                    onChange={() => toggleCheckbox('live', item.po_item_details_id)}
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
                                onChange={() => toggleCheckbox('store', item.po_item_details_id)}
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
                                onChange={() => toggleCheckbox('site', item.po_item_details_id)}
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
                                onChange={() => toggleCheckbox('spare', item.po_item_details_id)}
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
                                onChange={() => toggleCheckbox('live', item.po_item_details_id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span>Live</span>
                        </label>
                    )}
                </>
            ) : (
                <span className="text-sm font-bold text-red-500 sm:text-gray-500 sm:font-medium col-span-2">{item.po_item_status}</span>
            )}
            {/* Item Description */}
            <div className={`sm:col-span-3 ${thisEnabled ? '' : 'col-span-full sm:col-span-3'}`}>
                <div className="text-sm font-medium">SN: {item.item_serial_number} | {item.item_part_description}</div>
                <div className="text-xs text-gray-500">{item.item_type_name} | {item.item_make_name} | {item.item_model_name}</div>
            </div>
            {/* Location */}
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
                                    .catch(err => { addToast(err); return Promise.resolve([]); });
                            } else if (isSite) {
                                return api.get('/api/pops/searchByPopName', { params: { search: inputValue } })
                                    .then(response => response.data.data.map(p => ({ value: p.pop_id, label: p.pop_name })))
                                    .catch(err => { addToast(err); return Promise.resolve([]); });
                            } else {
                                return Promise.resolve([]); // Return empty array if not Store or Site
                            }
                        }}
                        isClearable
                        isDisabled={!(isStore || isSite)}
                        placeholder={
                            isStore ? 'Type Store Name' :
                                isSite ? 'Type POP Name' :
                                    (isSpare || isLive) ? 'Not Required' : 'Choose Phase'
                        }
                        value={isStore ? storeEntry.store_id : isSite ? dispatchEntry.site_id : null}
                        onChange={async (option) => {
                            handleSelectChange(
                                isStore ? 'stores' : 'sites',
                                isStore ? 'store_id' : 'site_id',
                                item.po_item_details_id
                            )(option);
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
            {/* Owner */}
            {thisEnabled ? (
                <div className={`sm:col-span-2`}>
                    <span className="font-medium sm:hidden">Owner</span>
                    <AsyncSelect
                        cacheOptions
                        loadOptions={async (inputValue) => {
                            const selectedLocationId = isStore ? (storeEntry.store_id ? storeEntry.store_id.value : null) : isSite ? (dispatchEntry.site_id ? dispatchEntry.site_id.value : null) : isSpare ? (spareEntry.store_id ? spareEntry.store_id.value : null) : (liveEntry.site_id ? liveEntry.site_id.value : null);
                            if (!selectedLocationId) {
                                return Promise.resolve([]); // Return empty array if no location selected
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
                            isStore ? "Type Incharge Name" :
                                isSite ? "Type Receiver Name" :
                                    (isSpare || isLive) ? "Not Required" : "Choose Phase"
                        }
                        value={isStore ? storeEntry.store_incharge_user_id : isSite ? dispatchEntry.site_incharge_user_id : null}
                        onChange={handleSelectChange(
                            isStore ? 'stores' :
                                isSite ? 'sites' :
                                    isSpare ? 'spares' : 'lives',
                            isStore || isSpare ? 'store_incharge_user_id' : 'site_incharge_user_id',
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
                <span className={`sm:col-span-2 text-gray-500 font-medium`}>
                    {item.last_owner}
                </span>
            )}
        </li>
    );
};

export default ItemCard;