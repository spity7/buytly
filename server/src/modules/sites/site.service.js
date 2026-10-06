import { URL } from "node:url";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/AppError.js";
import {
  PLATFORM_LISTING_POLICY,
  SITE_KIND,
  SITE_SLUG,
} from "./site.constants.js";
import { Site } from "./site.model.js";

const siteCacheByHost = new Map();
const siteCacheBySlug = new Map();
let allSitesCache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

function normalizeHost(host) {
  if (!host) return null;
  const value = host.toLowerCase().trim();
  return value.split(":")[0];
}

function invalidateSiteCache() {
  siteCacheByHost.clear();
  siteCacheBySlug.clear();
  allSitesCache = null;
  cacheExpiresAt = 0;
}

async function loadAllSites(force = false) {
  const now = Date.now();
  if (!force && allSitesCache && cacheExpiresAt > now) {
    return allSitesCache;
  }

  const sites = await Site.find({ isActive: true }).lean();
  allSitesCache = sites;
  cacheExpiresAt = now + CACHE_TTL_MS;

  siteCacheByHost.clear();
  siteCacheBySlug.clear();
  for (const site of sites) {
    siteCacheBySlug.set(site.slug, site);
    const hosts = new Set([
      normalizeHost(site.primaryDomain),
      ...(site.domains || []).map(normalizeHost),
    ]);
    for (const host of hosts) {
      if (host) siteCacheByHost.set(host, site);
    }
  }

  return sites;
}

function hostFromHeaderValue(value) {
  if (!value?.trim()) return null;
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return normalizeHost(new URL(value).host);
    }
  } catch {
    // fall through
  }
  return normalizeHost(value);
}

export const siteService = {
  invalidateCache: invalidateSiteCache,

  async ensureDefaultSites() {
    const defaults = [
      {
        slug: SITE_SLUG.BUYTLY,
        kind: SITE_KIND.PLATFORM,
        name: "Buytly",
        primaryDomain: "buytly.com",
        domains: ["www.buytly.com", "localhost"],
        publicUrl: "https://buytly.com",
        platformListingPolicy: PLATFORM_LISTING_POLICY.OPT_IN,
        branding: {
          siteDisplayName: "Buytly",
          supportEmail: "buytlyonline@gmail.com",
          supportPhone: "+96171601751",
          supportPhoneDisplay: "+961 71 601 751",
        },
      },
      {
        slug: SITE_SLUG.BUILDWISE,
        kind: SITE_KIND.TENANT,
        name: "Buildwise Engineering",
        primaryDomain: "buildwise-engineering.com",
        domains: ["www.buildwise-engineering.com"],
        publicUrl: "https://buildwise-engineering.com",
        platformListingPolicy: PLATFORM_LISTING_POLICY.OPT_IN,
        branding: {
          siteDisplayName: "Buildwise Engineering",
          supportEmail: "info@buildwise-engineering.com",
          supportPhone: "+96171703703",
          supportPhoneDisplay: "+961 71 703 703",
        },
      },
      {
        slug: SITE_SLUG.BLOCK57,
        kind: SITE_KIND.TENANT,
        name: "Block 57",
        primaryDomain: "block-57.com",
        domains: ["www.block-57.com"],
        publicUrl: "https://block-57.com",
        platformListingPolicy: PLATFORM_LISTING_POLICY.OPT_IN,
        branding: {
          siteDisplayName: "Block 57",
          supportEmail: "info@block-57.com",
          supportPhone: "+233244777772",
          supportPhoneDisplay: "+233 244 777 772",
          contactInboxEmail: "info@block-57.com",
        },
        // hidePublicPrices: hide listing prices from public viewers (see api-rules.md)
        features: { hidePublicPrices: true },
      },
    ];

    for (const entry of defaults) {
      await Site.updateOne(
        { slug: entry.slug },
        { $setOnInsert: entry },
        { upsert: true },
      );
    }

    invalidateSiteCache();
    return loadAllSites(true);
  },

  async getBySlug(slug) {
    await loadAllSites();
    const site = siteCacheBySlug.get(slug);
    if (!site) {
      throw new AppError(`Unknown site slug: ${slug}`, 404);
    }
    return site;
  },

  async getById(id) {
    const site = await Site.findById(id);
    if (!site || !site.isActive) {
      throw new AppError("Site not found", 404);
    }
    return site;
  },

  async resolveFromRequest(req) {
    const slugHeader = req.headers["x-site-slug"]?.toString().trim().toLowerCase();
    if (slugHeader) {
      await loadAllSites();
      const site = siteCacheBySlug.get(slugHeader);
      if (site) return site;
      throw new AppError(`Unknown site: ${slugHeader}`, 400);
    }

    const originHost = hostFromHeaderValue(req.headers.origin);
    const refererHost = hostFromHeaderValue(req.headers.referer);
    const host = originHost || refererHost;

    if (host) {
      await loadAllSites();
      const site = siteCacheByHost.get(host);
      if (site) return site;
    }

    if (env.DEFAULT_SITE_SLUG) {
      return this.getBySlug(env.DEFAULT_SITE_SLUG);
    }

    throw new AppError(
      "Could not resolve site from request. Set Origin or X-Site-Slug.",
      400,
    );
  },

  async listActiveSites() {
    return loadAllSites();
  },

  async getCorsOrigins() {
    const sites = await loadAllSites();
    const origins = new Set(
      env.CORS_ORIGIN.split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    );

    for (const site of sites) {
      origins.add(`https://${normalizeHost(site.primaryDomain)}`);
      origins.add(`http://${normalizeHost(site.primaryDomain)}`);
      for (const domain of site.domains || []) {
        const normalized = normalizeHost(domain);
        if (normalized === "localhost") {
          origins.add("http://localhost:3000");
          origins.add("http://localhost:3001");
          origins.add("http://localhost:3002");
          origins.add("http://127.0.0.1:3000");
          origins.add("http://127.0.0.1:3001");
          origins.add("http://127.0.0.1:3002");
          continue;
        }
        origins.add(`https://${normalized}`);
        origins.add(`http://${normalized}`);
      }
    }

    return [...origins];
  },
};
