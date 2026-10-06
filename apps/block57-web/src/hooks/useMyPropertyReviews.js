"use client";

import { buytlyApi } from "@/api/generated";
import { useAuthSafe } from "@/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const emptyReviews = {
  reviews: [],
  stats: { averageRating: 0, reviewCount: 0 },
  pagination: null,
};

export function useMyPropertyReviews({ page = 1, limit = 10 } = {}) {
  const auth = useAuthSafe();
  const canManageListings =
    auth?.user?.role === "seller" ||
    auth?.user?.role === "agent" ||
    auth?.user?.role === "admin";

  return useQuery({
    queryKey: ["my-property-reviews", page, limit],
    queryFn: async () => {
      const response = await buytlyApi.listMyPropertyReviews({ page, limit });
      return {
        reviews: response.data?.reviews || [],
        stats: response.data?.stats || { averageRating: 0, reviewCount: 0 },
        pagination: response.pagination,
      };
    },
    enabled: Boolean(auth?.user) && canManageListings,
    placeholderData: emptyReviews,
  });
}

export function useInvalidateMyPropertyReviews() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["my-property-reviews"] });
  };
}
