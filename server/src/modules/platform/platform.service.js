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
} from "./platform-query.js";

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

export const platformService = {
  async listFeaturedListings(query = {}) {
    const platformSite = assertPlatformRequestSite();
    const { sites, partnerSiteIds, siteById } = await getPartnerTenantSites(
      platformSite._id,
    );

    if (partnerSiteIds.length === 0) {
      return {
        properties: [],
        pagination: buildPaginationMeta(0, 1, query.limit || 20),
      };
    }

    const publicProjectIds = await getPublicPartnerProjectIds(
      partnerSiteIds,
      sites,
    );
    const visibilityOr = buildPlatformVisibilityOr(sites);

    const { page, limit, skip } = parsePagination(query);
    const filter = {
      siteId: { $in: partnerSiteIds },
      deletedAt: null,
      projectId: { $in: publicProjectIds },
      $or: visibilityOr,
    };

    if (query.status === "sold" || query.status === "active") {
      filter.status = query.status;
    } else {
      filter.status = { $in: PUBLIC_MARKETPLACE_LIST_STATUSES };
    }

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
        const sourceSite = siteById.get(String(property.siteId));
        return {
          ...doc,
          sourceSite: buildSourceSiteMeta(sourceSite, {
            listingPath: `/single-v1/${property._id}`,
          }),
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
    const { sites, partnerSiteIds, siteById } = await getPartnerTenantSites(
      platformSite._id,
    );

    if (partnerSiteIds.length === 0) {
      return {
        projects: [],
        pagination: buildPaginationMeta(0, 1, query.limit || 20),
      };
    }

    const visibilityOr = buildPlatformVisibilityOr(sites);
    const { page, limit, skip } = parsePagination(query);

    const filter = {
      siteId: { $in: partnerSiteIds },
      deletedAt: null,
      $or: visibilityOr,
    };

    if (query.status === "sold" || query.status === "active") {
      filter.status = query.status;
    } else {
      filter.status = { $in: PUBLIC_MARKETPLACE_LIST_STATUSES };
    }

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
        const sourceSite = siteById.get(String(project.siteId));
        const slug = project.slug;
        return {
          ...doc,
          sourceSite: buildSourceSiteMeta(sourceSite, {
            listingPath: `/project/${slug}`,
          }),
        };
      }),
    );

    return {
      projects: enriched,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
