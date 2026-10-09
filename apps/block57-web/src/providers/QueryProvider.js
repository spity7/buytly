"use client";

import LiveQuerySyncProvider from "@/providers/LiveQuerySyncProvider";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/lib/query/liveSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Public marketing pages: fewer background refetches (and view-count hits).
const STATIC_QUERY_STALE_TIME_MS = 5 * 60_000;

/**
 * @param {{ liveSync?: boolean }} props `liveSync={false}` skips
 *   LiveQuerySyncProvider polling and window-focus refetches (public site).
 */
export default function QueryProvider({ children, liveSync = true }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: liveSync
              ? DEFAULT_QUERY_STALE_TIME_MS
              : STATIC_QUERY_STALE_TIME_MS,
            retry: 1,
            refetchOnWindowFocus: liveSync,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {liveSync ? (
        <LiveQuerySyncProvider>{children}</LiveQuerySyncProvider>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
