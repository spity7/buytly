"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const HIGHLIGHT_DURATION_MS = 4000;

export function useHighlightQueryParam(paramName = "highlight") {
  const searchParams = useSearchParams();
  return searchParams.get(paramName);
}

/**
 * Scrolls to and temporarily highlights the row whose id matches `highlightId`.
 * Removes `?highlight=` from the URL once the row is in view so the address bar
 * reflects the resolved page/filters without re-triggering highlight on refresh.
 */
export function useDashboardRowHighlight({
  highlightId,
  ready = true,
  paramName = "highlight",
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const scrolledRef = useRef(false);
  const urlSyncedRef = useRef(false);
  const [activeHighlightId, setActiveHighlightId] = useState(null);

  const clearHighlightParam = useCallback(() => {
    if (urlSyncedRef.current || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (!params.has(paramName)) {
      urlSyncedRef.current = true;
      return;
    }

    params.delete(paramName);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    urlSyncedRef.current = true;
  }, [paramName, pathname, router]);

  useEffect(() => {
    if (!highlightId) {
      if (!urlSyncedRef.current) {
        setActiveHighlightId(null);
        scrolledRef.current = false;
      }
      return;
    }

    urlSyncedRef.current = false;
    setActiveHighlightId(highlightId);
    scrolledRef.current = false;
  }, [highlightId]);

  useEffect(() => {
    if (!ready || !activeHighlightId || scrolledRef.current) {
      return undefined;
    }

    const row = document.getElementById(`dashboard-row-${activeHighlightId}`);
    if (!row) {
      return undefined;
    }

    row.scrollIntoView({ behavior: "smooth", block: "center" });
    scrolledRef.current = true;
    clearHighlightParam();

    const timer = window.setTimeout(() => {
      setActiveHighlightId(null);
      urlSyncedRef.current = false;
    }, HIGHLIGHT_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [activeHighlightId, clearHighlightParam, ready]);

  const isHighlighted = useCallback(
    (id) =>
      Boolean(activeHighlightId) && String(id) === String(activeHighlightId),
    [activeHighlightId],
  );

  const getRowProps = useCallback(
    (id) => ({
      id: `dashboard-row-${id}`,
      className: isHighlighted(id) ? "dashboard-row-highlight" : undefined,
    }),
    [isHighlighted],
  );

  return {
    highlightId,
    activeHighlightId,
    isHighlighted,
    getRowProps,
  };
}
