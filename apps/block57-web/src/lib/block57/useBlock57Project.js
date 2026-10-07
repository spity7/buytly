"use client";

import { useMemo } from "react";
import { useProjectBySlug } from "@/hooks/useProjects";
import { BLOCK57_PROJECT_SLUG } from "@/content/block57/site";
import {
  getPublicUnits,
  groupUnitsByType,
  sortUnits,
  summarizeAvailability,
} from "./units";

/**
 * The Block 57 project with its public units, fetched on the client (unit media
 * URLs are signed for 1 hour, so they must never be baked in at build time).
 * React Query dedupes this across components: one request per page view.
 *
 * @returns {{
 *   project: object|null,
 *   units: object[],          // active + sold only, sorted by building/floor/title
 *   unitsByType: Record<string, object[]>,
 *   availability: { total: number, available: number, sold: number },
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   refetch: () => Promise<unknown>,
 * }}
 */
export function useBlock57Project(options = {}) {
  const query = useProjectBySlug(BLOCK57_PROJECT_SLUG, options);
  const project = query.data ?? null;

  const units = useMemo(() => sortUnits(getPublicUnits(project)), [project]);
  const unitsByType = useMemo(() => groupUnitsByType(units), [units]);
  const availability = useMemo(() => summarizeAvailability(units), [units]);

  return {
    project,
    units,
    unitsByType,
    availability,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useBlock57Project;
