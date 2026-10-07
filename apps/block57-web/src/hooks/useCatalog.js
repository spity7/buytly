"use client";

import { customInstance } from "@/lib/api/custom-instance";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getPropertyTypeLabel,
  PROPERTY_TYPE_FILTERS,
} from "@/lib/dashboard/filterOptions";

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

const ALL_PROPERTY_TYPES_OPTION = { value: "", label: "All property types" };

/**
 * Property type filter options and labels from this site's catalog, so tenant
 * types (e.g. Block 57's "Urban Villa") show and filter correctly. Falls back to
 * the static marketplace list until the catalog loads.
 */
export function usePropertyTypeOptions() {
  const { data: catalogTypes } = useCatalogPropertyTypes();

  return useMemo(() => {
    const fromCatalog = Array.isArray(catalogTypes)
      ? catalogTypes
          .filter((type) => type?.value && type.isActive !== false)
          .map((type) => ({
            value: type.value,
            label: type.label || type.value,
          }))
      : [];
    const options = fromCatalog.length
      ? [ALL_PROPERTY_TYPES_OPTION, ...fromCatalog]
      : PROPERTY_TYPE_FILTERS;
    const labels = new Map(
      options.map((option) => [option.value, option.label]),
    );
    const getLabel = (value) =>
      value ? labels.get(value) || getPropertyTypeLabel(value) : "—";

    return { options, getLabel };
  }, [catalogTypes]);
}
