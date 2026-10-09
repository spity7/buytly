"use client";

import { buytlyApi } from "@/api/generated";
import { useQuery } from "@tanstack/react-query";

export function useMyTransactions(params = {}, options = {}) {
  return useQuery({
    queryKey: ["my-transactions", params],
    queryFn: async () => {
      const response = await buytlyApi.getMyTransactions(params);
      return {
        transactions: response.data || [],
        pagination: response.pagination,
      };
    },
    ...options,
  });
}
