"use client";

import { buytlyApi } from "@/api/generated";
import { useQuery } from "@tanstack/react-query";

export function useAdminAnalytics(options = {}) {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const response = await buytlyApi.getAnalytics();
      return response.data ?? null;
    },
    ...options,
  });
}
