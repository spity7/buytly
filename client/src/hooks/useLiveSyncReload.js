"use client";

import { LIVE_SYNC_EVENT } from "@/lib/query/liveSync";
import { useEffect, useRef } from "react";

/**
 * Re-run a loader when global live sync fires (visibility + interval).
 * Pass `{ silent: true }` from the callback to avoid loading skeletons.
 */
export function useLiveSyncReload(reloadFn) {
  const reloadRef = useRef(reloadFn);
  reloadRef.current = reloadFn;

  useEffect(() => {
    const onSync = () => {
      void reloadRef.current({ silent: true });
    };

    window.addEventListener(LIVE_SYNC_EVENT, onSync);
    return () => window.removeEventListener(LIVE_SYNC_EVENT, onSync);
  }, []);
}
