export const BRAND_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Buildwise Engineering";

export const BRAND_SHORT_NAME = "Buildwise";

export const SITE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_SITE_PUBLIC_URL?.trim() ||
  "https://buildwise-engineering.com";

export const SITE_PUBLIC_WWW_LINK = (() => {
  try {
    const url = new URL(SITE_PUBLIC_URL);
    if (!url.hostname.startsWith("www.")) {
      url.hostname = `www.${url.hostname}`;
    }
    return url.origin;
  } catch {
    return "https://www.buildwise-engineering.com";
  }
})();

export const SITE_PUBLIC_WWW_LABEL = new URL(SITE_PUBLIC_WWW_LINK).hostname;

export const BRAND_LOGO_WHITE = "/images/buildwise-logo-white.png";
export const BRAND_LOGO_DARK = "/images/buildwise-logo-dark.png";

export const BRAND_LOGO_WIDTH = 138;
export const BRAND_LOGO_HEIGHT = 53;

/** Favicon assets: Next.js serves `src/app/icon.png` and `src/app/apple-icon.png` automatically. */
export const BRAND_FAVICON_16 = "/images/favicon-16x16.png";
export const BRAND_FAVICON_32 = "/images/favicon-32x32.png";
