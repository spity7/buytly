"use client";

import { buytlyApi } from "@/api/generated";
import {
  mapPlatformProjectsToCards,
  mapPlatformPropertiesToCards,
} from "@/lib/properties/mapProperty";
import { useQuery } from "@tanstack/react-query";

export function usePlatformFeaturedProperties(params = {}, options = {}) {
  return useQuery({
    queryKey: ["platform", "featured-listings", params],
    queryFn: async () => {
      const response = await buytlyApi.listPlatformFeaturedListings(params);
      const rows = response.data || [];
      return {
        properties: rows,
        cards: mapPlatformPropertiesToCards(rows),
        pagination: response.pagination,
      };
    },
    ...options,
  });
}

export function usePlatformFeaturedProjects(params = {}, options = {}) {
  return useQuery({
    queryKey: ["platform", "featured-projects", params],
    queryFn: async () => {
      const response = await buytlyApi.listPlatformFeaturedProjects(params);
      const rows = response.data || [];
      return {
        projects: rows,
        cards: mapPlatformProjectsToCards(rows),
        pagination: response.pagination,
      };
    },
    ...options,
  });
}
