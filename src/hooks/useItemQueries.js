// src/hooks/useItemQueries.js
import { useQuery } from '@tanstack/react-query';
import api from '../api/apiCall';

/**
 * Generic helper to reduce boilerplate for lookup-style queries (Types, Makes, Models, Parts)
 */
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

export const useCardTableData = (phaseId, { page = 0, limit = 10, search = null } = {}) => {
  return useQuery({
    queryKey: ['card-table-data', phaseId, page, limit, search],
    queryFn: async () => {
      const response = await api.get(`/api/dashboard/${phaseId}`, {
        params: { page: page + 1, limit, status_id: phaseId, search }
      });
      return response.data;
    },
    networkMode: 'always',
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
}

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

export const useItemModels = (itemMakeId, params = {}) => useBaseLookupQuery({
  key: 'item-models',
  endpoint: itemMakeId ? `/api/item-models/by-make/${itemMakeId}` : '/api/item-models',
  params,
  enabled: !!itemMakeId || params.page !== undefined,
  transformSelect: (data) => data.map(i => ({ value: i.item_model_id, label: i.item_model_name }))
});

export const useItemParts = (itemModelId, params = {}) => useBaseLookupQuery({
  key: 'item-parts',
  endpoint: itemModelId ? `/api/item-parts/by-model/${itemModelId}` : '/api/item-parts',
  params,
  enabled: !!itemModelId || params.page !== undefined,
  transformSelect: (data) => {
    const parts = data.map(i => ({ value: i.item_part_id, label: i.item_part_code }));
    const descriptions = data.reduce((acc, i) => {
      acc[i.item_part_id] = i.item_part_description;
      return acc;
    }, {});
    return { parts, descriptions };
  }
});

