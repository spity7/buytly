import { siteService } from "../modules/sites/site.service.js";
import { getRequestSite } from "./requestContext.js";

/**
 * Per-site price hiding (`site.features.hidePublicPrices`).
 *
 * Responses to viewers who cannot manage a listing (not the owner, assigned agent
 * or a site admin) replace prices with `priceLabel`. Sites without the flag are
 * untouched. Rules: docs/api-rules.md ("Hidden prices").
 */
export const PRICE_ON_REQUEST_LABEL = "Price on request";

export const siteHidesPublicPrices = (site) =>
  site?.features?.hidePublicPrices === true;

/** Tenant reads, where every listing belongs to the request site. */
export const requestSiteHidesPublicPrices = () =>
  siteHidesPublicPrices(getRequestSite());

/** Ids of active sites that hide prices (siteService cache, no per-listing queries). */
export async function getHiddenPriceSiteIds() {
  const sites = await siteService.listActiveSites();
  return sites.filter(siteHidesPublicPrices).map((site) => site._id);
}

const toPlain = (doc) =>
  typeof doc?.toObject === "function" ? doc.toObject() : doc;

/** Unit JSON without its price: `price: null` plus `priceLabel`. */
export function hideUnitPrice(doc) {
  if (!doc) return doc;
  return { ...toPlain(doc), price: null, priceLabel: PRICE_ON_REQUEST_LABEL };
}

/** Populate select for a unit on a personal record; owner/agent ids only when visibility must be decided. */
export const withManagerFields = (select, hidePrices) =>
  hidePrices ? `${select} ownerId agentId` : select;

/**
 * Populated unit on a personal record (favorite, booking, transaction) when prices
 * are hidden: drops the owner/agent ids added by `withManagerFields`, and the price
 * unless the viewer can manage the unit.
 */
export function applyPopulatedUnitPriceVisibility(property, canManage) {
  if (!property) return property;
  const plain = { ...toPlain(property) };
  delete plain.ownerId;
  delete plain.agentId;
  return canManage ? plain : hideUnitPrice(plain);
}

/** Project JSON without its unit price range: null `priceMin`/`priceMax` plus `priceLabel`. */
export function hideProjectPriceRange(doc) {
  if (!doc) return doc;
  return {
    ...toPlain(doc),
    priceMin: null,
    priceMax: null,
    priceLabel: PRICE_ON_REQUEST_LABEL,
  };
}
