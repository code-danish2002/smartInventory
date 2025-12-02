// src/hooks/useItemQueries.js
import { useQuery, useQueries } from '@tanstack/react-query';
import api from '../api/apiCall';

export const useItemTypes = () => {
  return useQuery({
    queryKey: ['item-types'],
    queryFn: async () => {
      const response = await api.get('/api/item-type');
      return response.data.data.map(i => ({ 
        value: i.item_type_id, 
        label: i.item_type_name 
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useItemMakes = (itemTypeId) => {
  return useQuery({
    queryKey: ['item-makes', itemTypeId],
    queryFn: async () => {
      if (!itemTypeId) return [];
      const response = await api.get(`/api/item-makes/by-type/${itemTypeId}`);
      return response.data.data.map(i => ({ 
        value: i.item_make_id, 
        label: i.item_make_name 
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!itemTypeId, // Only run if itemTypeId exists
  });
};

export const useItemModels = (itemMakeId) => {
  return useQuery({
    queryKey: ['item-models', itemMakeId],
    queryFn: async () => {
      if (!itemMakeId) return [];
      const response = await api.get(`/api/item-models/by-make/${itemMakeId}`);
      return response.data.data.map(i => ({ 
        value: i.item_model_id, 
        label: i.item_model_name 
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!itemMakeId, // Only run if itemMakeId exists
  });
};

export const useItemParts = (itemModelId) => {
  return useQuery({
    queryKey: ['item-parts', itemModelId],
    queryFn: async () => {
      if (!itemModelId) return { parts: [], descriptions: {} };
      const response = await api.get(`/api/item-parts/by-model/${itemModelId}`);
      const parts = response.data.data.map(i => ({ 
        value: i.item_part_id, 
        label: i.item_part_code 
      }));
      const descriptions = response.data.data.reduce((acc, i) => {
        acc[i.item_part_id] = i.item_part_description;
        return acc;
      }, {});
      return { parts, descriptions };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!itemModelId, // Only run if itemModelId exists
  });
};