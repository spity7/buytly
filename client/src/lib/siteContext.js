const siteSlug = () => process.env.NEXT_PUBLIC_SITE_SLUG?.trim() || "";

/** Buytly platform origin — aggregates opted-in partner listings. */
export function isPlatformMarketplaceSite() {
  return siteSlug() === "buytly";
}

/** Tenant sites (e.g. Buildwise) manage their own catalog + Buytly opt-in. */
export function isTenantMarketplaceSite() {
  const slug = siteSlug();
  return Boolean(slug) && slug !== "buytly";
}

export function userCanCrossSiteAdmin(user) {
  if (user?.role !== "admin") return false;
  const perms = user?.platformPermissions || [];
  return (
    perms.includes("cross_site_read") || perms.includes("cross_site_moderate")
  );
}

/** Buytly platform site admin — marketplace featuring + partner site filter. */
export function isBuytlyPlatformAdmin(user) {
  return isPlatformMarketplaceSite() && user?.role === "admin";
}
