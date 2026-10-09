import { Site } from "../../src/modules/sites/site.model.js";
import { siteService } from "../../src/modules/sites/site.service.js";
import { SITE_SLUG } from "../../src/modules/sites/site.constants.js";

export const TEST_SITE_SLUG = SITE_SLUG.BUYTLY;

export async function ensureTestSites() {
  await siteService.ensureDefaultSites();
  return Site.findOne({ slug: TEST_SITE_SLUG }).lean();
}

export function siteRequestHeaders(slug = TEST_SITE_SLUG) {
  return { "X-Site-Slug": slug };
}
