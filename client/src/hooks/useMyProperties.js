"use client";

import { buytlyApi } from "@/api/generated";
import { mapPropertiesToCards } from "@/lib/properties/mapProperty";
import { useQuery } from "@tanstack/react-query";

export function useMyProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ["my-properties", params],
    queryFn: async () => {
      const response = await buytlyApi.listMyProperties(params);
      return {
        properties: response.data || [],
        cards: mapPropertiesToCards(response.data || []),
        pagination: response.pagination,
      };
    },
    ...options,
  });
}
