"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buytlyApi } from "@/api/generated";
import { useAuthSafe } from "@/providers/AuthProvider";

/**
 * Lives under the "favorites" prefix, so `invalidateQueries({ queryKey:
 * ["favorites"] })` (used by the dashboard hooks too) refreshes it. A separate
 * key from `useFavorites()` because the cached data shape differs.
 */
export const FAVORITE_IDS_QUERY_KEY = ["favorites", "ids", { limit: 100 }];

const FAVORITES_LIMIT = 100; // server max (favorite.validation.js)

function toIdList(data) {
  return Array.isArray(data) ? data : [];
}

/**
 * Favourite unit ids of the signed-in user. Fetches the favourites list ONCE
 * (limit 100) and shares it through React Query: never one request per row
 * (the API rate limit is 200 requests / 15 min per IP).
 *
 * Signed out: `ids` is empty and nothing is requested; callers send the
 * visitor to sign in instead of calling `toggle`.
 *
 * @returns {{
 *   ids: Set<string>,
 *   isFavorite: (unitId: string) => boolean,
 *   toggle: (unitId: string) => Promise<boolean>, // resolves to the new state
 *   isPending: boolean,
 *   pendingId: string|null,
 *   isAuthenticated: boolean,
 *   isAuthLoading: boolean,
 *   isLoading: boolean,
 * }}
 */
export function useFavoriteIds() {
  const auth = useAuthSafe();
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const isAuthLoading = Boolean(auth?.isLoading);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FAVORITE_IDS_QUERY_KEY,
    enabled: isAuthenticated,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await buytlyApi.listFavorites({
        limit: FAVORITES_LIMIT,
      });
      return (response.data || [])
        .map((favorite) =>
          String(favorite?.property?._id ?? favorite?.property?.id ?? ""),
        )
        .filter(Boolean);
    },
  });

  const ids = useMemo(
    () => new Set(isAuthenticated ? toIdList(query.data) : []),
    [isAuthenticated, query.data],
  );

  const mutation = useMutation({
    mutationFn: async ({ unitId, isFavorite }) => {
      if (isFavorite) {
        await buytlyApi.removeFavorite(unitId);
        return false;
      }
      try {
        await buytlyApi.addFavorite({ propertyId: unitId });
      } catch (error) {
        // Already saved (another tab/device): treat as success.
        if (error?.response?.status === 409) return true;
        throw error;
      }
      return true;
    },
    onMutate: async ({ unitId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_QUERY_KEY });
      const previous = queryClient.getQueryData(FAVORITE_IDS_QUERY_KEY);
      queryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, (old) => {
        const list = toIdList(old).filter((id) => id !== unitId);
        return isFavorite ? list : [...list, unitId];
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(FAVORITE_IDS_QUERY_KEY, context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({
        queryKey: ["favorite-status", variables?.unitId],
      });
    },
  });

  const { mutateAsync } = mutation;

  const isFavorite = useCallback(
    (unitId) => Boolean(unitId) && ids.has(String(unitId)),
    [ids],
  );

  const toggle = useCallback(
    async (unitId) => {
      if (!isAuthenticated) {
        throw new Error("Sign in to save favourites.");
      }
      const id = String(unitId);
      return mutateAsync({ unitId: id, isFavorite: ids.has(id) });
    },
    [ids, isAuthenticated, mutateAsync],
  );

  return {
    ids,
    isFavorite,
    toggle,
    isPending: mutation.isPending,
    pendingId: mutation.isPending ? (mutation.variables?.unitId ?? null) : null,
    isAuthenticated,
    isAuthLoading,
    isLoading: isAuthenticated && query.isLoading,
  };
}

export default useFavoriteIds;
