"use client";

import { buytlyApi } from "@/api/generated";
import { mapPropertiesToCards } from "@/lib/properties/mapProperty";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavorites(params = {}) {
  return useQuery({
    queryKey: ["favorites", params],
    queryFn: async () => {
      const response = await buytlyApi.listFavorites(params);
      const favorites = response.data || [];
      const properties = favorites.map((fav) => fav.property).filter(Boolean);
      return {
        favorites,
        properties,
        cards: mapPropertiesToCards(properties),
        pagination: response.pagination,
      };
    },
  });
}

export function useFavoriteStatus(propertyId, enabled = true) {
  return useQuery({
    queryKey: ["favorite-status", propertyId],
    queryFn: async () => {
      const response = await buytlyApi.checkFavorite(propertyId);
      return Boolean(response.data?.isFavorite);
    },
    enabled: Boolean(propertyId) && enabled,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, isFavorite }) => {
      if (isFavorite) {
        await buytlyApi.removeFavorite(propertyId);
        return false;
      }
      await buytlyApi.addFavorite({ propertyId });
      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorite-status", variables.propertyId],
      });
    },
  });
}
