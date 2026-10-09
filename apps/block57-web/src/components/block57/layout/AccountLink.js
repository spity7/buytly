"use client";

import { useAuthSafe } from "@/providers/AuthProvider";
import { ACCOUNT_LINKS } from "@/content/block57/site";

/**
 * Account entry (not in the live header bar, OQ-37): "Sign in" when signed
 * out, "My account" when signed in. Rendered as the last mobile-drawer item
 * and as a small link in the footer's last band. Account pages live in the
 * `(app)` root layout, so this is a plain <a> (full page load). While the
 * session loads it keeps its space but is hidden and unfocusable.
 */
export default function AccountLink({ className }) {
  const auth = useAuthSafe();
  const loading = !auth || auth.isLoading;
  const link = auth?.user ? ACCOUNT_LINKS.account : ACCOUNT_LINKS.signIn;

  return (
    <a
      href={link.href}
      className={className}
      style={loading ? { visibility: "hidden" } : undefined}
      {...(loading ? { "aria-hidden": "true", tabIndex: -1 } : {})}
    >
      {link.label}
    </a>
  );
}
