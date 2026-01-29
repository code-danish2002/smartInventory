import AsyncSelect from "react-select/async";
import api from "../api/apiCall.js";
import { commonSelectProps } from '../utils/CommonCSS.jsx';

const LocationOwnerSelect = ({ storeSelect = false, siteSelect = false, addToast, itemData, lineItemId, onChange }) => {
  // Bulk change handlers
  const handleBulkLocationChange = (option) => {
    // Get the appropriate change handler from the parent
    const handler = onChange('stores', 'store_id');
    handler(option);
  };

  const handleBulkOwnerChange = (option) => {
    // Get the appropriate change handler from the parent
    const handler = onChange('stores', 'store_incharge_user_id');
    handler(option);
  };

  const handleBulkSiteLocationChange = (option) => {
    // Get the appropriate change handler from the parent
    const handler = onChange('sites', 'site_id');
    handler(option);
  };

  const handleBulkSiteOwnerChange = (option) => {
    // Get the appropriate change handler from the parent
    const handler = onChange('sites', 'site_incharge_user_id');
    handler(option);
  };

  return (
    <div className='sm:grid sm:grid-cols-2 gap-2 space-y-2 sm:space-y-0 mt-2'>
      {storeSelect && (
        <>
          <AsyncSelect
            cacheOptions
            loadOptions={async (inputValue) => {
              if (inputValue.length <= 2) {
                return Promise.resolve([]);
              }
              return api.get('/api/stores/searchByStoreName', { params: { search: inputValue } })
                .then(response => response.data.data.map(s => ({ value: s.store_id, label: s.store_name })))
                .catch(err => { addToast(err); return Promise.resolve([]); });
            }}
            isClearable
            placeholder="Type Store Name"
            value={null}
            onChange={handleBulkLocationChange}
            {...commonSelectProps}
            styles={{
              ...commonSelectProps.styles,
              control: (base) => ({
                ...base,
                minHeight: '42px',
                maxHeight: '65px',
                overflowY: 'auto'
              }),
            }}
          />
          <AsyncSelect
            cacheOptions
            loadOptions={async (inputValue) => {
              if (inputValue.length <= 2) {
                return Promise.resolve([]);
              }
              return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
                .then(response => response.data.data.map(u => ({ value: u.user_id, label: u.user_name })))
                .catch(err => { addToast(err); return Promise.resolve([]); });
            }}
            isClearable
            placeholder="Type Incharge Name"
            value={null}
            onChange={handleBulkOwnerChange}
            {...commonSelectProps}
            styles={{
              ...commonSelectProps.styles,
              control: (base) => ({
                ...base,
                minHeight: '42px',
                maxHeight: '65px',
                overflowY: 'auto'
              }),
            }}
          />
        </>
      )}
      {/* {Bulk Site location} */}
      {siteSelect && (
        <>
          <AsyncSelect
            cacheOptions
            loadOptions={async (inputValue) => {
              if (inputValue.length <= 2) {
                return Promise.resolve([]);
              }
              return api.get('/api/pops/searchByPopName', { params: { search: inputValue } })
                .then(response => response.data.data.map(p => ({ value: p.pop_id, label: p.pop_name })))
                .catch(err => { addToast(err); return Promise.resolve([]); });
            }}
            isClearable
            placeholder="Type Site Name"
            value={null}
            onChange={handleBulkSiteLocationChange}
            {...commonSelectProps}
            styles={{
              ...commonSelectProps.styles,
              control: (base) => ({
                ...base,
                minHeight: '42px',
                maxHeight: '65px',
                overflowY: 'auto'
              }),
            }}
          />
          {/* {Bulk owner} */}
          <AsyncSelect
            cacheOptions
            loadOptions={async (inputValue) => {
              if (inputValue.length <= 2) {
                return Promise.resolve([]);
              }
              return api.get('/api/user-details/searchByUserName', { params: { search: inputValue } })
                .then(response => response.data.data.map(u => ({ value: u.user_id, label: u.user_name })))
                .catch(err => { addToast(err); return Promise.resolve([]); });
            }}
            isClearable
            placeholder="Type Owner Name"
            value={null}
            onChange={handleBulkSiteOwnerChange}
            {...commonSelectProps}
            styles={{
              ...commonSelectProps.styles,
              control: (base) => ({
                ...base,
                minHeight: '42px',
                maxHeight: '65px',
                overflowY: 'auto'
              }),
            }}
          />
        </>
      )}
    </div>
  )
};
export default LocationOwnerSelect;