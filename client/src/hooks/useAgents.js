"use client";

import { buytlyApi } from "@/api/generated";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAgents(params = {}, options = {}) {
  return useQuery({
    queryKey: ["agents", params],
    queryFn: async () => {
      const response = await buytlyApi.listAgents(params);
      return {
        agents: response.data || [],
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useAgent(id, options = {}) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const response = await buytlyApi.getAgentById(id);
      return response.data ?? null;
    },
    enabled: Boolean(id),
    ...options,
  });
}
