import { Site } from "../sites/site.model.js";
import { Project } from "../projects/project.model.js";
import {
  SITE_KIND,
  PLATFORM_LISTING_POLICY,
} from "../sites/site.constants.js";
import { PUBLIC_MARKETPLACE_LIST_STATUSES } from "../properties/property-status.js";

export const PUBLIC_PARENT_PROJECT_STATUSES = PUBLIC_MARKETPLACE_LIST_STATUSES;

export async function getPartnerTenantSites(platformSiteId) {
  const sites = await Site.find({
    isActive: true,
    kind: SITE_KIND.TENANT,
    _id: { $ne: platformSiteId },
  }).lean();

  const partnerSites = sites.filter(
    (s) =>
      s.platformListingPolicy === PLATFORM_LISTING_POLICY.DEFAULT_VISIBLE ||
      s.platformListingPolicy === PLATFORM_LISTING_POLICY.OPT_IN,
  );

  return {
    sites: partnerSites,
    partnerSiteIds: partnerSites.map((s) => s._id),
    siteById: new Map(partnerSites.map((s) => [String(s._id), s])),
  };
}

export function buildPlatformVisibilityOr(sites) {
  const optInSiteIds = sites
    .filter((s) => s.platformListingPolicy === PLATFORM_LISTING_POLICY.OPT_IN)
    .map((s) => s._id);
  const defaultVisibleSiteIds = sites
    .filter(
      (s) =>
        s.platformListingPolicy === PLATFORM_LISTING_POLICY.DEFAULT_VISIBLE,
    )
    .map((s) => s._id);

  const or = [
    { visibleOnPlatform: true },
    {
      siteId: { $in: defaultVisibleSiteIds },
      visibleOnPlatform: { $ne: false },
    },
  ];

  if (optInSiteIds.length) {
    or.push({
      siteId: { $in: optInSiteIds },
      visibleOnPlatform: true,
    });
  }

  return or;
}

export async function getPublicPartnerProjectIds(partnerSiteIds, sites) {
  if (!partnerSiteIds.length) return [];
  const visibilityOr = buildPlatformVisibilityOr(sites);
  return Project.find({
    siteId: { $in: partnerSiteIds },
    deletedAt: null,
    status: { $in: PUBLIC_PARENT_PROJECT_STATUSES },
    $or: visibilityOr,
  }).distinct("_id");
}

export function buildSourceSiteMeta(sourceSite, { listingPath }) {
  if (!sourceSite) return null;
  const publicBase =
    sourceSite.publicUrl || `https://${sourceSite.primaryDomain || ""}`;
  const base = publicBase.replace(/\/$/, "");
  return {
    slug: sourceSite.slug,
    name: sourceSite.name,
    publicUrl: publicBase,
    listingUrl: `${base}${listingPath}`,
  };
}
