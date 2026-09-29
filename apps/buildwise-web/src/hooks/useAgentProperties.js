"use client";

import { buytlyApi } from "@/api/generated";
import { mapPropertiesToCards } from "@/lib/properties/mapProperty";
import { useQuery } from "@tanstack/react-query";

export function useAgentProperties(agentId, params = {}) {
  return useQuery({
    queryKey: ["agent-properties", agentId, params],
    queryFn: async () => {
      const response = await buytlyApi.getAgentProperties(agentId, params);
      return {
        properties: response.data || [],
        cards: mapPropertiesToCards(response.data || []),
        pagination: response.pagination,
      };
    },
    enabled: Boolean(agentId),
  });
}
