import { env } from "../../config/env.js";
import { SITE_SLUG } from "./site.constants.js";

const DEV_DEFAULTS = {
  [SITE_SLUG.BUILDWISE]: "http://localhost:3001",
  [SITE_SLUG.BUYTLY]: "http://localhost:3000",
};

function normalizeBase(url) {
  if (!url) return "";
  return String(url).trim().replace(/\/$/, "");
}

/**
 * Base URL for linking to a site's public frontend (partner cards, emails, etc.).
 * In development, prefers SITE_PUBLIC_URL_* env vars, then local dev defaults.
 */
export function resolveSitePublicBaseUrl(site) {
  if (!site) return "";

  const slug = site.slug;
  if (slug === SITE_SLUG.BUILDWISE && env.SITE_PUBLIC_URL_BUILDWISE) {
    return normalizeBase(env.SITE_PUBLIC_URL_BUILDWISE);
  }
  if (slug === SITE_SLUG.BUYTLY && env.SITE_PUBLIC_URL_BUYTLY) {
    return normalizeBase(env.SITE_PUBLIC_URL_BUYTLY);
  }

  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    const devDefault = slug && DEV_DEFAULTS[slug];
    if (devDefault) {
      return devDefault;
    }
  }

  const fromDb =
    site.publicUrl ||
    (site.primaryDomain ? `https://${site.primaryDomain}` : "");
  return normalizeBase(fromDb);
}
