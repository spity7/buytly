"use client";

import { buytlyApi } from "@/api/generated";
import { mapPropertiesToCards } from "@/lib/properties/mapProperty";
import { useQuery } from "@tanstack/react-query";

export function useProperties(params = {}, options = {}) {
  const query = useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const response = await buytlyApi.listProperties(params);
      return {
        properties: response.data || [],
        cards: mapPropertiesToCards(response.data || []),
        pagination: response.pagination,
      };
    },
    ...options,
  });

  return query;
}
