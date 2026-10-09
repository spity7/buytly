const LEGACY_PREFIXES = ["avatars/", "projects/", "properties/"];

function isLegacyGcsKey(gcsKey) {
  if (!gcsKey || typeof gcsKey !== "string") return false;
  return LEGACY_PREFIXES.some((prefix) => gcsKey.startsWith(prefix));
}

/**
 * Maps a stored gcsKey to the sites/{slug}/ layout when needed.
 * @returns {{ action: "skip" | "migrate" | "unknown", newKey?: string, gcsKey?: string }}
 */
export function resolveMigratedGcsKey(gcsKey, siteSlug) {
  if (!gcsKey || typeof gcsKey !== "string") {
    return { action: "unknown", gcsKey };
  }
  if (!siteSlug) {
    return { action: "unknown", gcsKey };
  }
  if (gcsKey.startsWith("sites/")) {
    return { action: "skip" };
  }
  if (isLegacyGcsKey(gcsKey)) {
    return { action: "migrate", newKey: `sites/${siteSlug}/${gcsKey}` };
  }
  return { action: "unknown", gcsKey };
}

export { LEGACY_PREFIXES, isLegacyGcsKey };
