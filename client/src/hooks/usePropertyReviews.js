"use client";

import { buytlyApi } from "@/api/generated";
import { useAuthSafe } from "@/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const emptyReviews = {
  reviews: [],
  stats: { averageRating: 0, reviewCount: 0 },
  pagination: null,
};

export function usePropertyReviews(propertyId, options = {}) {
  return useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: async () => {
      try {
        const response = await buytlyApi.listPropertyReviews(propertyId);
        return {
          reviews: response.data?.reviews || [],
          stats: response.data?.stats || { averageRating: 0, reviewCount: 0 },
          pagination: response.pagination,
        };
      } catch (error) {
        if (error?.response?.status === 404) {
          return emptyReviews;
        }
        throw error;
      }
    },
    enabled: Boolean(propertyId),
    retry: false,
    ...options,
  });
}

export function usePropertyReviewStatus(propertyId) {
  const auth = useAuthSafe();
  const isAuthenticated = Boolean(auth?.user);

  return useQuery({
    queryKey: ["property-review-check", propertyId],
    queryFn: async () => {
      const response = await buytlyApi.checkPropertyReview(propertyId);
      return response.data?.hasReviewed ?? false;
    },
    enabled: Boolean(propertyId) && isAuthenticated,
  });
}

export function useCreatePropertyReview(propertyId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      buytlyApi.createPropertyReview(propertyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-reviews", propertyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["property-review-check", propertyId],
      });
    },
  });
}
