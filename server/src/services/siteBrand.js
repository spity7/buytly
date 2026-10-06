import { env } from "../config/env.js";
import { getRequestSite } from "../shared/requestContext.js";
import { resolveSitePublicBaseUrl } from "../modules/sites/sitePublicUrl.js";

/** Used when there is no request site (scripts, unit tests). */
export const DEFAULT_BRAND_NAME = "Buytly";

const trimTrailingSlash = (url) =>
  String(url || "")
    .trim()
    .replace(/\/+$/, "");

/**
 * Public frontend base URL for links in emails and notifications.
 * Uses the site's public URL (SITE_PUBLIC_URL_* / dev default / sites.publicUrl)
 * and falls back to APP_URL when no site is known.
 */
export function resolveSiteLinkBase(site = getRequestSite()) {
  return trimTrailingSlash(resolveSitePublicBaseUrl(site) || env.APP_URL);
}

/** Absolute frontend URL for an app path such as `/reset-password?token=…`. */
export function buildSiteLink(path, site = getRequestSite()) {
  return `${resolveSiteLinkBase(site)}${path}`;
}

/**
 * Brand shown in emails: `{ name, url, supportEmail }` for the request site,
 * or the Buytly fallback (APP_URL, CONTACT_INBOX_EMAIL) without a site.
 */
export function resolveSiteBrand(site = getRequestSite()) {
  if (!site) {
    return {
      name: DEFAULT_BRAND_NAME,
      url: resolveSiteLinkBase(null),
      supportEmail: env.CONTACT_INBOX_EMAIL,
    };
  }

  return {
    name:
      site.branding?.siteDisplayName?.trim() ||
      site.name?.trim() ||
      DEFAULT_BRAND_NAME,
    url: resolveSiteLinkBase(site),
    supportEmail: site.branding?.supportEmail?.trim() || "",
  };
}
