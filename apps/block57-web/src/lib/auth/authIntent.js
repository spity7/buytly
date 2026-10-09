import { AUTH_ENTRY_PATH } from "./constants";
import { normalizePath } from "@/lib/url/normalizePath";

export const ADD_PROPERTY_PATH = "/dashboard-add-project";

const SIGNUP_ROLES = new Set(["buyer", "seller", "agent"]);
// Whitespace/control characters are stripped by URL parsers ("/\t/evil.com"
// becomes "//evil.com") and "\" is treated as "/", so reject both outright.
const UNSAFE_PATH_CHARS = /[\s\\\u0000-\u001f\u007f]/;
const SAME_ORIGIN_PROBE = "http://same-origin.invalid";

let pendingIntent = null;

function normalizeIntent({ tab, role, next, intentHint } = {}) {
  return {
    tab: tab === "signup" || tab === "signin" ? tab : undefined,
    role: SIGNUP_ROLES.has(role) ? role : undefined,
    next: isSafeInternalPath(next) ? next : undefined,
    intentHint: intentHint === "listing" ? "listing" : undefined,
  };
}

/** Same-origin relative path ("/…"); rejects "//host", "/\host" and URLs. */
export function isSafeInternalPath(path) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    UNSAFE_PATH_CHARS.test(path)
  ) {
    return false;
  }

  try {
    return new URL(path, SAME_ORIGIN_PROBE).origin === SAME_ORIGIN_PROBE;
  } catch {
    return false;
  }
}

export function setAuthIntent(intent) {
  pendingIntent = intent ? normalizeIntent(intent) : null;
}

export function consumeAuthIntent() {
  const intent = pendingIntent;
  pendingIntent = null;
  return intent;
}

export function parseAuthIntentFromSearchParams(searchParams) {
  const auth = searchParams.get("auth");
  if (auth !== "signin" && auth !== "signup") {
    return null;
  }

  const role = searchParams.get("role");
  const next = searchParams.get("next");
  const intent = searchParams.get("intent");

  return normalizeIntent({
    tab: auth,
    role,
    next,
    intentHint:
      intent === "listing" || role === "seller" ? "listing" : undefined,
  });
}

/**
 * Params for the full-page auth entry: like `parseAuthIntentFromSearchParams`
 * but the tab defaults to "signin" when `?auth=` is missing or invalid.
 */
export function parseAuthEntryParams(searchParams) {
  const auth = searchParams.get("auth");
  const tab = auth === "signup" ? "signup" : "signin";
  const params = new URLSearchParams(searchParams.toString());
  params.set("auth", tab);
  return parseAuthIntentFromSearchParams(params);
}

/**
 * URL of the full-page auth entry (`/login/`). `next` is kept only when it is
 * a safe internal path that is not the auth entry itself (no redirect loops).
 */
export function buildAuthEntryUrl({ tab = "signin", next, role, intent } = {}) {
  const params = new URLSearchParams();
  params.set("auth", tab === "signup" ? "signup" : "signin");

  if (SIGNUP_ROLES.has(role)) {
    params.set("role", role);
  }

  if (
    isSafeInternalPath(next) &&
    normalizePath(next) !== normalizePath(AUTH_ENTRY_PATH)
  ) {
    params.set("next", next);
  }

  if (intent === "listing") {
    params.set("intent", "listing");
  }

  return `${AUTH_ENTRY_PATH}?${params.toString()}`;
}

/** Current path + query, for `next=` in client-side auth redirects. */
export function getCurrentPathForNext() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function buildListingSignupIntent() {
  return {
    tab: "signup",
    role: "seller",
    next: ADD_PROPERTY_PATH,
    intentHint: "listing",
  };
}
