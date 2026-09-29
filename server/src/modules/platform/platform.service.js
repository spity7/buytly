import mongoose from "mongoose";
import { Site } from "../sites/site.model.js";
import { Property } from "../properties/property.model.js";
import { Project } from "../projects/project.model.js";
import { SITE_KIND, PLATFORM_LISTING_POLICY } from "../sites/site.constants.js";
import { getRequestSite } from "../../shared/requestContext.js";
import { AppError } from "../../shared/AppError.js";
import { attachPropertyMediaUrls } from "../properties/property.service.js";
import { parsePagination, buildPaginationMeta } from "../../shared/pagination.js";

const PUBLIC_PARENT_PROJECT_STATUSES = ["active", "sold"];

function assertPlatformRequestSite() {
  const site = getRequestSite();
  if (!site || site.kind !== SITE_KIND.PLATFORM) {
    throw new AppError("Platform listings are only available on the platform site", 403);
  }
  return site;
}

async function getPartnerSiteIds(platformSiteId) {
  const sites = await Site.find({
    isActive: true,
    kind: SITE_KIND.TENANT,
    _id: { $ne: platformSiteId },
  }).lean();

  return sites
    .filter(
      (s) =>
        s.platformListingPolicy === PLATFORM_LISTING_POLICY.DEFAULT_VISIBLE ||
        s.platformListingPolicy === PLATFORM_LISTING_POLICY.OPT_IN,
    )
    .map((s) => s._id);
}

export const platformService = {
  async listFeaturedListings(query = {}) {
    const platformSite = assertPlatformRequestSite();
    const partnerSiteIds = await getPartnerSiteIds(platformSite._id);

    if (partnerSiteIds.length === 0) {
      return {
        properties: [],
        pagination: buildPaginationMeta(0, 1, query.limit || 20),
      };
    }

    const sites = await Site.find({ _id: { $in: partnerSiteIds } }).lean();
    const siteById = new Map(sites.map((s) => [String(s._id), s]));

    const optInSiteIds = sites
      .filter((s) => s.platformListingPolicy === PLATFORM_LISTING_POLICY.OPT_IN)
      .map((s) => s._id);
    const defaultVisibleSiteIds = sites
      .filter(
        (s) => s.platformListingPolicy === PLATFORM_LISTING_POLICY.DEFAULT_VISIBLE,
      )
      .map((s) => s._id);

    const publicProjectIds = await Project.find({
      siteId: { $in: partnerSiteIds },
      deletedAt: null,
      status: { $in: PUBLIC_PARENT_PROJECT_STATUSES },
      $or: [
        { visibleOnPlatform: true },
        {
          siteId: { $in: defaultVisibleSiteIds },
          visibleOnPlatform: { $ne: false },
        },
      ],
    }).distinct("_id");

    const { page, limit, skip } = parsePagination(query);
    const filter = {
      siteId: { $in: partnerSiteIds },
      deletedAt: null,
      status: "active",
      projectId: { $in: publicProjectIds },
      $or: [
        { visibleOnPlatform: true },
        {
          siteId: { $in: defaultVisibleSiteIds },
          visibleOnPlatform: { $ne: false },
        },
      ],
    };

    if (optInSiteIds.length) {
      filter.$or.push({
        siteId: { $in: optInSiteIds },
        visibleOnPlatform: true,
      });
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("projectId", "title slug status siteId visibleOnPlatform"),
      Property.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      properties.map(async (property) => {
        const doc = await attachPropertyMediaUrls(property);
        const sourceSite = siteById.get(String(property.siteId));
        const publicBase =
          sourceSite?.publicUrl || `https://${sourceSite?.primaryDomain || ""}`;
        return {
          ...doc,
          sourceSite: sourceSite
            ? {
                slug: sourceSite.slug,
                name: sourceSite.name,
                publicUrl: publicBase,
                listingUrl: `${publicBase.replace(/\/$/, "")}/single-v1/${property._id}`,
              }
            : null,
        };
      }),
    );

    return {
      properties: enriched,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
