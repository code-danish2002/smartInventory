# React Query Usage Guide

This guide explains how to use the standardized `useQuery` hooks defined in `src/hooks/useItemQueries.js` to simplify data fetching, searching, and pagination.

---

## Available Hooks

All hooks share common caching settings:
- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes

### 1. `useCardTableData(phaseId, { page, limit, search })`
Fetches detailed table data for a specific dashboard phase/status.
- **Parameters**: `page` (0-indexed), `limit` (results per page), `search` (optional string).
- **Return Value**: The full API response object (includes `data` and `pagination` details).

### 2. `useItemTypes({ page, limit, search }?)`
Fetches item types.
- **Select Mode** (No params): Returns `[{ value, label }, ...]` for `react-select`.
- **Table Mode** (With params): Returns the full API response object with raw data and pagination.

### 3. `useItemMakes(itemTypeId, { page, limit, search }?)`
Fetches manufacturers (makes).
- **Select Mode**: Filtered by `itemTypeId`, returns value/label pairs.
- **Table Mode**: Can be filtered by `itemTypeId` OR used for a general list with pagination.

### 4. `useItemModels(itemMakeId, { page, limit, search }?)`
Fetches models. Works exactly like `useItemMakes`.

### 5. `useItemParts(itemModelId, { page, limit, search }?)`
Fetches parts.
- **Select Mode**: Returns `{ parts: [{ value, label }], descriptions: { id: text } }`.
- **Table Mode**: Returns the full API response object.

---

## Usage Examples

### A. Usage in a Table (MasterDataView replacement)
When you provide `page` or `limit`, the hook returns the raw data and pagination metadata.

```javascript
const { data: response, isLoading } = useItemTypes({ 
  page: 0, 
  limit: 10, 
  search: 'router' 
});

const rows = response?.data || [];
const totalCount = response?.pagination?.total || 0;
```

### B. Usage in a Select/Dropdown
When called without pagination parameters, the hooks automatically format the data for `react-select`.

```javascript
const { data: types } = useItemTypes();

<Select options={types} />
```

### C. Replacing Manual API Calls in CardTable
```javascript
// BEFORE (Manual)
useEffect(() => {
  api.get(`/api/dashboard/${phaseId}`, { params: { page: page+1, ... } })
    .then(res => setData(res.data.data));
}, [page, phaseId]);

// AFTER (Hook)
const { data: response } = useCardTableData(phaseId, { page, limit: pageSize, search: searchTerm });
const data = response?.data || [];
```

---

## Performance & UX Benefits

### 1. Zero Loading for Cached Data
If a user goes to "At Store" (page 1), then "Live", and then back to "At Store", the data is served **instantly** from the cache. There is no network request and no loading spinner.

### 2. Reduced Server Load (Stale-While-Revalidate)
React Query won't hammer your server if the data is fresh (within 5 minutes). Even when it refetches, it keeps the old data visible (`keepPreviousData`), making the app feel faster and more stable.

### 3. Automatic Background Sync
- **Window Focus**: If you switch tabs to check an email and come back, React Query automatically refreshes the counts so you always see current data.
- **Reconnect**: If the internet drops and comes back, it automatically retries failed queries.

### 4. Leaner Components
By removing `useEffect`, `setLoading`, `setData`, and `setError` boilerplate, your components become 30-40% smaller and much easier to debug.

---
> [!TIP]
> Use the `keepPreviousData: true` option (active in `useCardTableData`) to keep the current table visible while the next page is loading, preventing layout flickers!
