import { runWithRequestContext } from "../../src/shared/requestContext.js";
import { ensureTestSites } from "./siteFixtures.js";

export async function runWithTestSite(callback) {
  const site = await ensureTestSites();
  return runWithRequestContext({ site }, callback);
}

export async function getTestSiteId() {
  const site = await ensureTestSites();
  return site._id;
}
