import { Property } from "../properties/property.model.js";
import { Project } from "../projects/project.model.js";
import { SITE_KIND } from "../sites/site.constants.js";
import { getRequestSite } from "../../shared/requestContext.js";
import { AppError } from "../../shared/AppError.js";
import { attachPropertyMediaUrls } from "../properties/property.service.js";
import { gcsService } from "../../services/gcs.service.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../shared/pagination.js";
import { PUBLIC_MARKETPLACE_LIST_STATUSES } from "../properties/property-status.js";
import {
  buildPlatformVisibilityOr,
  buildSourceSiteMeta,
  getPartnerTenantSites,
  getPublicPartnerProjectIds,
  getPublicPlatformSiteProjectIds,
  parsePartnersOnlyQuery,
} from "./platform-query.js";
import { resolveSitePublicBaseUrl } from "../sites/sitePublicUrl.js";

const attachProjectMediaUrls = async (project) => {
  const doc = project.toObject ? project.toObject() : { ...project };
  if (doc.media?.length) {
    doc.media = await Promise.all(
      doc.media.map(async (item) => {
        if (!item.gcsKey) return item;
        const url = await gcsService.getSignedUrl(item.gcsKey);
        return { ...item, url };
      }),
    );
  }
  return doc;
};

function assertPlatformRequestSite() {
  const site = getRequestSite();
  if (!site || site.kind !== SITE_KIND.PLATFORM) {
    throw new AppError(
      "Platform listings are only available on the platform site",
      403,
    );
  }
  return site;
}

function buildPropertySort(query) {
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  if (sortBy === "price") return { price: sortOrder };
  if (sortBy === "viewCount") return { viewCount: sortOrder };
  return { createdAt: sortOrder };
}

function buildProjectSort(query) {
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  if (sortBy === "viewCount") return { viewCount: sortOrder };
  if (sortBy === "title") return { title: sortOrder };
  return { createdAt: sortOrder };
}

function buildMarketplaceStatusFilter(query) {
  if (query.status === "sold" || query.status === "active") {
    return { status: query.status };
  }
  return { status: { $in: PUBLIC_MARKETPLACE_LIST_STATUSES } };
}

function resolveListingSourceSite(
  siteDoc,
  listingSiteId,
  platformSiteId,
  listingPath,
) {
  if (!siteDoc) return null;
  const isFirstParty = String(listingSiteId) === String(platformSiteId);
  if (isFirstParty) {
    return {
      slug: siteDoc.slug,
      name: siteDoc.name,
      publicUrl: resolveSitePublicBaseUrl(siteDoc),
    };
  }
  return buildSourceSiteMeta(siteDoc, { listingPath });
}

async function buildUnitCatalogScope(platformSite, query) {
  const partnersOnly = parsePartnersOnlyQuery(query);
  const { sites, partnerSiteIds, siteById } = await getPartnerTenantSites(
    platformSite._id,
  );
  siteById.set(String(platformSite._id), platformSite);

  const platformProjectIds = partnersOnly
    ? []
    : await getPublicPlatformSiteProjectIds(platformSite._id);

  const partnerProjectIds =
    partnerSiteIds.length > 0
      ? await getPublicPartnerProjectIds(partnerSiteIds, sites)
      : [];

  const visibilityOr = buildPlatformVisibilityOr(sites);
  const unitBranches = [];

  if (platformProjectIds.length > 0) {
    unitBranches.push({
      siteId: platformSite._id,
      projectId: { $in: platformProjectIds },
    });
  }

  if (partnerSiteIds.length > 0 && partnerProjectIds.length > 0) {
    unitBranches.push({
      siteId: { $in: partnerSiteIds },
      projectId: { $in: partnerProjectIds },
      $or: visibilityOr,
    });
  }

  return { unitBranches, siteById, platformSite };
}

async function buildProjectCatalogScope(platformSite, query) {
  const partnersOnly = parsePartnersOnlyQuery(query);
  const { sites, partnerSiteIds, siteById } = await getPartnerTenantSites(
    platformSite._id,
  );
  siteById.set(String(platformSite._id), platformSite);

  const visibilityOr = buildPlatformVisibilityOr(sites);
  const projectBranches = [];

  if (!partnersOnly) {
    projectBranches.push({
      siteId: platformSite._id,
    });
  }

  if (partnerSiteIds.length > 0) {
    projectBranches.push({
      siteId: { $in: partnerSiteIds },
      $or: visibilityOr,
    });
  }

  return { projectBranches, siteById, platformSite };
}

export const platformService = {
  async listFeaturedListings(query = {}) {
    const platformSite = assertPlatformRequestSite();
    const { unitBranches, siteById } = await buildUnitCatalogScope(
      platformSite,
      query,
    );

    const { page, limit, skip } = parsePagination(query);

    if (unitBranches.length === 0) {
      return {
        properties: [],
        pagination: buildPaginationMeta(0, page, limit),
      };
    }

    const filter = {
      deletedAt: null,
      $or: unitBranches,
      ...buildMarketplaceStatusFilter(query),
    };

    if (query.type) filter.type = query.type;
    if (query.city) filter["location.city"] = new RegExp(query.city, "i");
    if (query.bedrooms) filter.bedrooms = { $gte: query.bedrooms };
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = query.minPrice;
      if (query.maxPrice) filter.price.$lte = query.maxPrice;
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .sort(buildPropertySort(query))
        .skip(skip)
        .limit(limit)
        .populate("projectId", "title slug status siteId visibleOnPlatform"),
      Property.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      properties.map(async (property) => {
        const doc = await attachPropertyMediaUrls(property);
        const sourceSiteDoc = siteById.get(String(property.siteId));
        return {
          ...doc,
          sourceSite: resolveListingSourceSite(
            sourceSiteDoc,
            property.siteId,
            platformSite._id,
            `/single-v1/${property._id}`,
          ),
        };
      }),
    );

    return {
      properties: enriched,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async listFeaturedProjects(query = {}) {
    const platformSite = assertPlatformRequestSite();
    const { projectBranches, siteById } = await buildProjectCatalogScope(
      platformSite,
      query,
    );

    const { page, limit, skip } = parsePagination(query);

    if (projectBranches.length === 0) {
      return {
        projects: [],
        pagination: buildPaginationMeta(0, page, limit),
      };
    }

    const filter = {
      deletedAt: null,
      $or: projectBranches,
      ...buildMarketplaceStatusFilter(query),
    };

    if (query.city) filter["location.city"] = new RegExp(query.city, "i");
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort(buildProjectSort(query))
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    const enriched = await Promise.all(
      projects.map(async (project) => {
        const doc = await attachProjectMediaUrls(project);
        const sourceSiteDoc = siteById.get(String(project.siteId));
        const slug = project.slug;
        return {
          ...doc,
          sourceSite: resolveListingSourceSite(
            sourceSiteDoc,
            project.siteId,
            platformSite._id,
            `/project/${slug}`,
          ),
        };
      }),
    );

    return {
      projects: enriched,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
