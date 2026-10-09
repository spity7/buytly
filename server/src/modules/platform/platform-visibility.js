import { AppError } from "../../shared/AppError.js";
import { getRequestSite } from "../../shared/requestContext.js";
import { ROLES } from "../../shared/constants.js";
import { PUBLIC_LIST_STATUSES } from "../properties/property-status.js";
import { SITE_KIND } from "../sites/site.constants.js";

export function assertCanSetVisibleOnPlatform(listing, enabling) {
  if (!enabling) return;
  if (!PUBLIC_LIST_STATUSES.has(listing.status)) {
    throw new AppError(
      "Only published or sold listings can be featured on the marketplace",
      400,
    );
  }
}

export function assertUnitPlatformVisibility(project, enabling) {
  if (!enabling) return;
  if (!project.visibleOnPlatform) {
    throw new AppError(
      "Feature the parent project on the marketplace first",
      400,
    );
  }
}

export function assertPlatformSiteAdmin(actor) {
  const site = getRequestSite();
  if (site?.kind !== SITE_KIND.PLATFORM) {
    throw new AppError(
      "Marketplace featuring is only available on the platform site",
      403,
    );
  }
  if (actor?.role !== ROLES.ADMIN) {
    throw new AppError("Not authorized to feature marketplace listings", 403);
  }
}

/** Reject seller/tenant PATCH attempts before Zod strips unknown keys. */
export function rejectTenantPlatformFeaturingPatch(req, _res, next) {
  if (
    req.body &&
    Object.prototype.hasOwnProperty.call(req.body, "visibleOnPlatform")
  ) {
    return next(new AppError("You cannot change marketplace featuring", 403));
  }
  next();
}

/** Hide aggregator flag from tenant-site API consumers. */
export function stripTenantPlatformVisibility(doc) {
  if (!doc || getRequestSite()?.kind !== SITE_KIND.TENANT) {
    return doc;
  }
  if (typeof doc.toObject === "function") {
    const plain = doc.toObject();
    delete plain.visibleOnPlatform;
    return plain;
  }
  if (Array.isArray(doc)) {
    return doc.map(stripTenantPlatformVisibility);
  }
  const rest = { ...doc };
  delete rest.visibleOnPlatform;
  return rest;
}
