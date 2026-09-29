"use client";

import { customInstance } from "@/lib/api/custom-instance";
import { useQuery } from "@tanstack/react-query";

export function useCatalogNearbyPreview(latitude, longitude, options = {}) {
  const lat = latitude ? Number(latitude) : null;
  const lng = longitude ? Number(longitude) : null;
  const enabled =
    options.enabled !== undefined
      ? options.enabled
      : lat != null &&
        lng != null &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng);

  return useQuery({
    queryKey: ["catalog", "nearby", lat, lng],
    queryFn: async () => {
      const response = await customInstance({
        url: "/catalog/nearby",
        method: "GET",
        params: { lat, lng },
      });
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
}
