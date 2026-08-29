"use client";

import { buytlyApi } from "@/api/generated";
import { useQuery } from "@tanstack/react-query";

export function useMyBookings(params = {}, options = {}) {
  return useQuery({
    queryKey: ["my-bookings", params],
    queryFn: async () => {
      const response = await buytlyApi.getMyBookings(params);
      return {
        bookings: response.data || [],
        pagination: response.pagination,
      };
    },
    ...options,
  });
}

export function useAgentBookings(params = {}, options = {}) {
  return useQuery({
    queryKey: ["agent-bookings", params],
    queryFn: async () => {
      const response = await buytlyApi.getAgentBookings(params);
      return {
        bookings: response.data || [],
        pagination: response.pagination,
      };
    },
    ...options,
  });
}
