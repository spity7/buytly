/** Default React Query stale window before a background refetch is allowed. */
export const DEFAULT_QUERY_STALE_TIME_MS = 30_000;

/** Poll interval for refetching mounted (active) queries while the tab is visible. */
export const ACTIVE_QUERY_REFETCH_INTERVAL_MS = 30_000;

/** Unread notification badge + list freshness while the app is open. */
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000;

/** Dispatched when background sync runs (pairs with React Query refetch). */
export const LIVE_SYNC_EVENT = "buytly:live-sync";
