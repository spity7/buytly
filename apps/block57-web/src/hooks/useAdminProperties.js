"use client";

import { buytlyApi } from "@/api/generated";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAdminProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin-properties", params],
    queryFn: async () => {
      const response = await buytlyApi.adminListProperties(params);
      return {
        properties: response.data || [],
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
