"use client";

import { buytlyApi } from "@/api/generated";
import { useQuery } from "@tanstack/react-query";

export function useAdminPartnerSites(enabled = true) {
  return useQuery({
    queryKey: ["admin", "partner-sites"],
    queryFn: async () => {
      const response = await buytlyApi.adminListPartnerSites();
      return response.data || [];
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}
