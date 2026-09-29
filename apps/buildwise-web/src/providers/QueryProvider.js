"use client";

import LiveQuerySyncProvider from "@/providers/LiveQuerySyncProvider";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/lib/query/liveSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: DEFAULT_QUERY_STALE_TIME_MS,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LiveQuerySyncProvider>{children}</LiveQuerySyncProvider>
    </QueryClientProvider>
  );
}
