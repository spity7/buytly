/**
 * Canonical form of an internal path for exact comparisons. `trailingSlash`
 * is on, so `usePathname()` returns "/dashboard-home/" while hrefs are often
 * written as "/dashboard-home". Drops any query/hash and trailing slashes
 * (except for the root "/").
 */
export function normalizePath(pathname) {
  const path = String(pathname ?? "").split(/[?#]/)[0];
  if (!path || path === "/") {
    return "/";
  }
  return path.replace(/\/+$/, "") || "/";
}

/** True when both paths point to the same route, ignoring trailing slashes. */
export function isSamePath(a, b) {
  return normalizePath(a) === normalizePath(b);
}

/**
 * Menu active state: exact match for "/", otherwise the item or any of its
 * children (e.g. "/apartments/urban-villa/" for "/apartments/").
 */
export function isPathActive(pathname, href) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/") {
    return current === "/";
  }
  return current === target || current.startsWith(`${target}/`);
}
