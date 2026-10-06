"use client";

import { useEffect, useRef, useState } from "react";
import { findPaginatedHighlightPage } from "@/lib/dashboard/findPaginatedHighlightPage";

/**
 * When a dashboard row is linked via ?highlight= but missing from the current
 * list (wrong page or filters), scans the API and invokes `onResolved`.
 */
export function useResolveDashboardHighlight({
  highlightId,
  items = [],
  isLoading = false,
  enabled = true,
  getItemId = (item) => item._id,
  resolve,
}) {
  const [resolving, setResolving] = useState(false);
  const resolvedRef = useRef(null);

  useEffect(() => {
    resolvedRef.current = null;
  }, [highlightId]);

  useEffect(() => {
    if (!enabled || !highlightId || isLoading || resolving || !resolve) {
      return undefined;
    }

    if (resolvedRef.current === highlightId) {
      return undefined;
    }

    const foundLocally = items.some(
      (item) => String(getItemId(item)) === String(highlightId),
    );

    if (foundLocally) {
      resolvedRef.current = highlightId;
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setResolving(true);
      try {
        const result = await resolve({
          highlightId,
          findPage: (fetchPage) =>
            findPaginatedHighlightPage({
              highlightId,
              fetchPage,
              getItemId,
            }),
        });

        if (!cancelled) {
          resolvedRef.current = highlightId;
        }
      } finally {
        if (!cancelled) {
          setResolving(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, getItemId, highlightId, isLoading, items, resolve, resolving]);

  return resolving;
}
