export const BRAND_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Block 57";

export const BRAND_SHORT_NAME = "Block 57";

export const SITE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SITE_PUBLIC_URL?.trim() || "https://block-57.com";

/** Hosts where a `www.` prefix would not resolve (local dev / raw IPs). */
function isLocalOrIpHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    hostname.includes(":")
  );
}

export const SITE_PUBLIC_WWW_LINK = (() => {
  try {
    const url = new URL(SITE_PUBLIC_URL);
    if (!url.hostname.startsWith("www.") && !isLocalOrIpHost(url.hostname)) {
      url.hostname = `www.${url.hostname}`;
    }
    return url.origin;
  } catch {
    return "https://www.block-57.com";
  }
})();

export const SITE_PUBLIC_WWW_LABEL = new URL(SITE_PUBLIC_WWW_LINK).hostname;

/** PLACEHOLDER wordmarks until the real Block 57 logo files are captured. */
export const BRAND_LOGO_WHITE = "/images/block57-logo-white.png";
export const BRAND_LOGO_DARK = "/images/block57-logo-dark.png";

/** Matches `public/images/block57-logo-*.png` (876×318, same 438×159 ratio as before). */
export const BRAND_LOGO_WIDTH = 175;
export const BRAND_LOGO_HEIGHT = 63;

/** Favicon assets: source `public/images/block57-favicon.png` (placeholder); run `scripts/generate-favicons.ps1`. Next.js serves `src/app/icon.png` and `src/app/apple-icon.png`. */
export const BRAND_FAVICON_16 = "/images/favicon-16x16.png";
export const BRAND_FAVICON_32 = "/images/favicon-32x32.png";
