"use client";

import { useMemo } from "react";
import { resolveUnitType } from "@/content/block57/unitTypes";
import { useBlock57Project } from "./useBlock57Project";
import { summarizeAvailability } from "./units";

/**
 * Public units (active + sold only, sorted by building/floor/title) of one
 * residence type, optionally limited to one building ("A" | "B" | "C").
 * `typeKey` is the type's catalog value (`unit.type`, e.g. "one-bedroom") or
 * its page slug ("1-bedroom"): both resolve to the same units.
 * Shares the single project request of the page (React Query dedupes it).
 */
export function useTypeUnits(typeKey, { building } = {}) {
  const { unitsByType, isLoading, isError, refetch, project } =
    useBlock57Project();
  const catalogValue =
    resolveUnitType(typeKey)?.catalogValue ??
    String(typeKey ?? "").toLowerCase();

  const units = useMemo(() => {
    const list = unitsByType[catalogValue] || [];
    if (!building) return list;
    const target = String(building).trim().toUpperCase();
    return list.filter(
      (unit) =>
        String(unit?.building ?? "")
          .trim()
          .toUpperCase() === target,
    );
  }, [unitsByType, catalogValue, building]);

  const availability = useMemo(() => summarizeAvailability(units), [units]);

  return {
    units,
    availability,
    // `isLoading` is false while disabled; treat "no data yet, no error" as loading.
    isLoading: isLoading || (!project && !isError),
    isError: isError && !project,
    refetch,
  };
}

export default useTypeUnits;
