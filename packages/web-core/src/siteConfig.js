/**
 * Shared site branding helpers for workspace frontends.
 * Each app sets NEXT_PUBLIC_* at build time.
 */
export function getSiteSlug() {
  return process.env.NEXT_PUBLIC_SITE_SLUG?.trim() || "buytly";
}

export function getSiteDisplayName() {
  return (
    process.env.NEXT_PUBLIC_SITE_NAME?.trim() ||
    (getSiteSlug() === "buildwise"
      ? "Buildwise Engineering"
      : "Buytly")
  );
}

export function getSupportWhatsAppMessage() {
  const name = getSiteDisplayName();
  return `Hi, I need help with ${name}.`;
}

export function getSupportMailtoSubject() {
  return `${getSiteDisplayName()} support request`;
}
