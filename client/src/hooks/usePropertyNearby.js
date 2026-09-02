"use client";

import { customInstance } from "@/lib/api/custom-instance";
import { useQuery } from "@tanstack/react-query";

export function usePropertyNearby(propertyId, options = {}) {
  return useQuery({
    queryKey: ["property", propertyId, "nearby"],
    queryFn: async () => {
      const response = await customInstance({
        url: `/properties/${propertyId}/nearby`,
        method: "GET",
      });
      return response.data;
    },
    enabled: Boolean(propertyId),
    staleTime: 1000 * 60 * 60,
    ...options,
  });
}
