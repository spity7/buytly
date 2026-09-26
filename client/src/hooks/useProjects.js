"use client";

import { buytlyApi } from "@/api/generated";
import { mapProjectsToCards } from "@/lib/properties/mapProperty";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useProjects(params = {}, options = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => {
      const response = await buytlyApi.listProjects(params);
      return {
        projects: response.data || [],
        cards: mapProjectsToCards(response.data || []),
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useMyProjects(params = {}, options = {}) {
  return useQuery({
    queryKey: ["my-projects", params],
    queryFn: async () => {
      const response = await buytlyApi.listMyProjects(params);
      return {
        projects: response.data || [],
        cards: mapProjectsToCards(response.data || []),
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useProject(id, options = {}) {
  return useQuery({
    queryKey: ["project", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await buytlyApi.getProjectById(id, {
        includeUnits: "true",
      });
      return response.data;
    },
    ...options,
  });
}

export function useProjectBySlug(slug, options = {}) {
  return useQuery({
    queryKey: ["project", "slug", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await buytlyApi.getProjectBySlug(slug);
      return response.data;
    },
    ...options,
  });
}
