# Target Implementation: Master Data & CardTable

This guide shows the exact manual changes for your master data hooks and the `CardTable` refresh logic.

---

## 1. Master Data Hooks (`src/hooks/useItemQueries.js`)

Add this once at the top of the file to handle all lookups:

```javascript
import { useQuery } from '@tanstack/react-query';
import api from '../api/apiCall';

const useBaseLookupQuery = ({ key, endpoint, params, transformSelect, enabled = true }) => {
  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const response = await api.get(endpoint, {
        params: { 
          page: params.page !== undefined ? params.page + 1 : undefined, 
          limit: params.limit, 
          search: params.search 
        }
      });
      if (params.page === undefined && transformSelect) {
        return transformSelect(response.data.data);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

// Example Clean Master Hooks:
export const useItemTypes = (params = {}) => useBaseLookupQuery({
  key: 'item-types',
  endpoint: '/api/item-types',
  params,
  transformSelect: (data) => data.map(i => ({ value: i.item_type_id, label: i.item_type_name }))
});

export const useItemMakes = (itemTypeId, params = {}) => useBaseLookupQuery({
  key: 'item-makes',
  endpoint: itemTypeId ? `/api/item-makes/by-type/${itemTypeId}` : '/api/item-makes',
  params,
  enabled: !!itemTypeId || params.page !== undefined,
  transformSelect: (data) => data.map(i => ({ value: i.item_make_id, label: i.item_make_name }))
});
```

---

## 2. CardTable Implementation (`src/components/cardTable.jsx`)

Here is how to set up the `useQuery` and the **Refresh Logic**.

```javascript
import { useQueryClient } from '@tanstack/react-query'; // 1. IMPORT
import { useCardTableData } from "../hooks/useItemQueries.js";

const CardTable = ({ phaseId, onBackToDashboard }) => {
    const queryClient = useQueryClient(); // 2. INITIALIZE CLIENT
    
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState(null);

    // 3. GET DATA (No useEffect needed for fetching)
    const { data: tableData, isLoading } = useCardTableData(phaseId, {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
    });

    // 4. REFRESH LOGIC (The Replacement for refreshTableData)
    const handleGlobalRefresh = () => {
        // This tells React Query to refetch 'card-table-data'
        queryClient.invalidateQueries({ queryKey: ['card-table-data'] });
    };

    return (
        <MyTable
            loading={isLoading}
            data={tableData?.data || []}
            total={tableData?.pagination?.total || 0}
            // ... other props
            refreshData={handleGlobalRefresh} // 5. Pass it to your table
        />
    );
};
```

---

## 3. How to Trigger Refresh from OTHER components
If you have a separate "Upload" or "Edit" component that affects the `CardTable` data:

```javascript
import { useQueryClient } from '@tanstack/react-query';

const EditItemModal = () => {
  const queryClient = useQueryClient();

  const handleSave = async () => {
    await api.post('/api/save', data);
    
    // This logic updates the Table automatically!
    queryClient.invalidateQueries({ queryKey: ['card-table-data'] });
  };
};
```

### Key Differences for you:
1.  **Remove `refreshTableData` state**: You don't need `const [refreshTableData, setRefreshTableData] = useState(false)`.
2.  **Remove the `useEffect` for fetching**: `useCardTableData` starts fetching automatically when the component mounts or when `currentPage`/`searchTerm` changes.
3.  **Invalidate for Actions**: Only call `queryClient.invalidateQueries` when an action happens (Delete, Save, Update) that changes the data on the server.
