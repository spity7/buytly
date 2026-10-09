/**
 * Public Block 57 pages for dashboard "view" links. The site shows one
 * development, so every project links to the apartments overview, and
 * `/apartments/?unit=<id>` opens the unit on its residence-type page.
 * (The legacy /project/:slug/ and /single-v1/:id/ URLs redirect here too.)
 */
export const PUBLIC_PROJECT_HREF = "/apartments/";

export function getPublicUnitHref(unitId) {
  return unitId
    ? `/apartments/?unit=${encodeURIComponent(String(unitId))}`
    : PUBLIC_PROJECT_HREF;
}
