import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import {
  ADDRESS,
  CONTACT,
  COORDINATES,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/content/block57/site";
import { AMENITIES } from "@/content/block57/amenities";

const BASE_URL = SITE_PUBLIC_URL.replace(/\/+$/, "");

/** Internal path with the trailing slash the site uses ("/apartments" → "/apartments/"). */
export function withTrailingSlash(path = "/") {
  const str = String(path || "/");
  const cut = str.search(/[?#]/);
  let pathname = cut === -1 ? str : str.slice(0, cut);
  const rest = cut === -1 ? "" : str.slice(cut);
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  const lastSegment = pathname.split("/").pop();
  // Files ("/sitemap.xml") keep their form.
  if (!pathname.endsWith("/") && !lastSegment.includes(".")) {
    pathname = `${pathname}/`;
  }
  return `${pathname}${rest}`;
}

/** Absolute URL on the public site origin (NEXT_PUBLIC_SITE_PUBLIC_URL). */
export function absoluteUrl(path = "/") {
  return `${BASE_URL}${withTrailingSlash(path)}`;
}

/**
 * Next.js metadata for a public page: canonical, OpenGraph and Twitter card.
 * Pass no `title` for the home page (tab shows "Block 57" only); inner pages get
 * the layout template "%s | Block 57".
 *
 * @param {{ title?: string, description?: string, path?: string,
 *   image?: { url: string, width?: number, height?: number, alt?: string },
 *   noindex?: boolean }} options
 */
export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image,
  noindex = false,
} = {}) {
  const canonical = withTrailingSlash(path);
  const segment = String(title ?? "").trim();
  const fullTitle = segment ? `${segment} | ${SITE_NAME}` : SITE_NAME;
  const images = image?.url ? [image] : undefined;

  return {
    title: segment ? segment : { absolute: SITE_NAME },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GH",
      url: canonical,
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      ...(images ? { images: images.map((img) => img.url) } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** schema.org ApartmentComplex for the development (render with <JsonLd />). */
export function buildApartmentComplexJsonLd({ path = "/" } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(path),
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: `${ADDRESS.neighbourhood}, ${ADDRESS.city}`,
      addressCountry: ADDRESS.countryCode,
    },
    // Approximate until the exact site pin is confirmed (Phase 0).
    geo: {
      "@type": "GeoCoordinates",
      latitude: COORDINATES.lat,
      longitude: COORDINATES.lng,
    },
    amenityFeature: AMENITIES.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.title,
      value: true,
    })),
  };
}
