"use client";

import { buytlyApi } from "@/api/generated";
import { mapPropertyToCard } from "@/lib/properties/mapProperty";
import { useQuery } from "@tanstack/react-query";

export function useProperty(id, options = {}) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await buytlyApi.getPropertyById(id);
      const property = response.data;
      return {
        property,
        card: mapPropertyToCard(property),
      };
    },
    enabled: Boolean(id),
    ...options,
  });
}
