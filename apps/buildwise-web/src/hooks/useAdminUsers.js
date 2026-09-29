"use client";

import { buytlyApi } from "@/api/generated";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAdminUsers(params = {}, options = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await buytlyApi.adminListUsers(params);
      return {
        users: response.data || [],
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
