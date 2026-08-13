export const ADD_PROPERTY_PATH = "/dashboard-add-property";

const SIGNUP_ROLES = new Set(["buyer", "seller", "agent"]);

let pendingIntent = null;

function normalizeIntent({ tab, role, next, intentHint } = {}) {
  return {
    tab: tab === "signup" || tab === "signin" ? tab : undefined,
    role: SIGNUP_ROLES.has(role) ? role : undefined,
    next: isSafeInternalPath(next) ? next : undefined,
    intentHint: intentHint === "listing" ? "listing" : undefined,
  };
}

export function isSafeInternalPath(path) {
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
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

export function buildListingSignupIntent() {
  return {
    tab: "signup",
    role: "seller",
    next: ADD_PROPERTY_PATH,
    intentHint: "listing",
  };
}
