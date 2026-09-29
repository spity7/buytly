import { SITE_KIND, PLATFORM_PERMISSIONS } from "../modules/sites/site.constants.js";
import { getRequestSite } from "./requestContext.js";

export function isPlatformSite(site) {
  return site?.kind === SITE_KIND.PLATFORM;
}

export function userHasPlatformPermission(user, permission) {
  if (!user?.platformPermissions?.length) return false;
  return user.platformPermissions.includes(permission);
}

export function isPlatformAdmin(user, site = getRequestSite()) {
  if (!user || user.role !== "admin") return false;
  if (!isPlatformSite(site)) return false;
  return (
    userHasPlatformPermission(user, PLATFORM_PERMISSIONS.CROSS_SITE_READ) ||
    userHasPlatformPermission(user, PLATFORM_PERMISSIONS.CROSS_SITE_MODERATE)
  );
}

export function siteScopedFilter(siteId, extra = {}) {
  return { siteId, ...extra };
}
