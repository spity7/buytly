"use client";

import { customInstance } from "@/lib/api/custom-instance";
import { useQuery } from "@tanstack/react-query";

async function fetchCatalogPropertyTypes() {
  const response = await customInstance({
    url: "/catalog/property-types",
    method: "GET",
  });
  return response.data;
}

async function fetchCatalogAmenities() {
  const response = await customInstance({
    url: "/catalog/amenities",
    method: "GET",
  });
  return response.data;
}

export function useCatalogPropertyTypes(options = {}) {
  return useQuery({
    queryKey: ["catalog", "property-types"],
    queryFn: fetchCatalogPropertyTypes,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCatalogAmenities(options = {}) {
  return useQuery({
    queryKey: ["catalog", "amenities"],
    queryFn: fetchCatalogAmenities,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useAdminCatalogPropertyTypes(options = {}) {
  return useQuery({
    queryKey: ["admin", "catalog", "property-types"],
    queryFn: async () => {
      const response = await customInstance({
        url: "/admin/catalog/property-types",
        method: "GET",
      });
      return response.data;
    },
    staleTime: 1000 * 30,
    ...options,
  });
}

export function useAdminCatalogAmenities(options = {}) {
  return useQuery({
    queryKey: ["admin", "catalog", "amenities"],
    queryFn: async () => {
      const response = await customInstance({
        url: "/admin/catalog/amenities",
        method: "GET",
      });
      return response.data;
    },
    staleTime: 1000 * 30,
    ...options,
  });
}
