"use client";

import {
  ACTIVE_QUERY_REFETCH_INTERVAL_MS,
  LIVE_SYNC_EVENT,
} from "@/lib/query/liveSync";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

function refetchVisibleActiveQueries(queryClient) {
  if (typeof document === "undefined") {
    return;
  }
  if (document.visibilityState !== "visible") {
    return;
  }

  void queryClient.refetchQueries({
    type: "active",
    stale: true,
  });

  window.dispatchEvent(new CustomEvent(LIVE_SYNC_EVENT));
}

export default function LiveQuerySyncProvider({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onVisible = () => {
      refetchVisibleActiveQueries(queryClient);
    };

    document.addEventListener("visibilitychange", onVisible);

    const intervalId = window.setInterval(
      () => refetchVisibleActiveQueries(queryClient),
      ACTIVE_QUERY_REFETCH_INTERVAL_MS,
    );

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(intervalId);
    };
  }, [queryClient]);

  return children;
}
