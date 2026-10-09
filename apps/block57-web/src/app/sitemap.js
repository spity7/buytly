import { absoluteUrl } from "@/lib/block57/seo";
import { UNIT_TYPE_SLUGS } from "@/content/block57/unitTypes";

/**
 * Static sitemap of the public Block 57 pages (CI builds without the API, so
 * nothing here is fetched): the live block-57.com pages with the same URLs
 * (residence pages use the live slugs: /apartments/1-bedroom/ …). Absolute
 * URLs from NEXT_PUBLIC_SITE_PUBLIC_URL, with the trailing slashes the site
 * uses. /brochure/ is a redirect to the file and is left out.
 */
export default function sitemap() {
  const lastModified = new Date();
  const page = (path, priority, changeFrequency = "monthly") => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly"),
    page("/life-style/", 0.7),
    page("/apartments/", 0.9, "weekly"),
    ...UNIT_TYPE_SLUGS.map((slug) =>
      page(`/apartments/${slug}/`, 0.8, "weekly"),
    ),
    page("/amenities/", 0.7),
    page("/gallery/", 0.6),
    page("/inquire/", 0.8),
    page("/contact/", 0.6),
  ];
}
