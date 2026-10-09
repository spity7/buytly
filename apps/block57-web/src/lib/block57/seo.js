import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import {
  ADDRESS,
  CONTACT,
  COORDINATES,
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/content/block57/site";
import { getAsset } from "@/lib/block57/assets";

const BASE_URL = SITE_PUBLIC_URL.replace(/\/+$/, "");

/** Separator of the live document titles: "Lifestyle – Block 57" (en dash). */
export const TITLE_SEPARATOR = " – ";

/** Layout `metadata.title.template` (live format, OQ-28). */
export const TITLE_TEMPLATE = `%s${TITLE_SEPARATOR}${SITE_NAME}`;

/** Default share image (OQ-29): the VV_7 exterior render. */
const DEFAULT_OG_IMAGE = (() => {
  const { src, width, height, alt } = getAsset("img-023");
  return { url: src, width, height, alt };
})();

/** Amenities named on the live home page (home.amenities), for JSON-LD. */
const AMENITY_FEATURES = [
  "24 hour Concierge",
  "Swimming Pool",
  "Rooftop",
  "Underground Parking",
  "Gym & Fitness",
  "Kids Playground",
  "Convenience Store",
  "Padel Court",
];

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
 * Next.js metadata for a public page: title, canonical, OpenGraph and Twitter
 * card. With a `title` the tab reads "<title> – Block 57" (layout template);
 * without one (home page) it reads the live home title
 * "Block 57 – Real estate Project".
 *
 * @param {{ title?: string, description?: string, path?: string,
 *   image?: { url: string, width?: number, height?: number, alt?: string },
 *   noindex?: boolean }} options
 *   `image` defaults to the VV_7 exterior render.
 */
export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
} = {}) {
  const canonical = withTrailingSlash(path);
  const segment = String(title ?? "").trim();
  const fullTitle = segment
    ? `${segment}${TITLE_SEPARATOR}${SITE_NAME}`
    : HOME_TITLE;
  const images = image?.url ? [image] : undefined;

  return {
    title: segment ? segment : { absolute: HOME_TITLE },
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
    image: `${BASE_URL}${DEFAULT_OG_IMAGE.url}`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: `${ADDRESS.neighbourhood}, ${ADDRESS.city}`,
      addressCountry: ADDRESS.countryCode,
    },
    // Centre of the live contact map; the exact site pin is unconfirmed (OQ-06).
    geo: {
      "@type": "GeoCoordinates",
      latitude: COORDINATES.lat,
      longitude: COORDINATES.lng,
    },
    amenityFeature: AMENITY_FEATURES.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };
}
