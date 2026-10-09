import AmenityHighlights from "@/components/block57/amenities/AmenityHighlights";
import AmenityRow from "@/components/block57/amenities/AmenityRow";
import PageHero from "@/components/block57/ui/PageHero";
import { AMENITIES_PAGE, AMENITY_ROWS } from "@/content/block57/amenities";
import { getAsset } from "@/lib/block57/assets";
import { buildPageMetadata } from "@/lib/block57/seo";

const ogImage = getAsset(AMENITIES_PAGE.ogImage);

export const metadata = buildPageMetadata({
  title: AMENITIES_PAGE.title,
  description: AMENITIES_PAGE.metaDescription,
  path: AMENITIES_PAGE.path,
  image: {
    url: ogImage.src,
    width: ogImage.width,
    height: ogImage.height,
    alt: ogImage.alt,
  },
});

/**
 * /amenities/ (WordPress URL kept), statically prerendered. Live order:
 * global hero band, five alternating 50/50 rows (photo left on rows 1, 3, 5),
 * the "highlights" heading and three cards, then the footer (no pre-footer
 * tiles). The hidden "Wellness" carousel and demo banners are not built.
 */
export default function AmenitiesPage() {
  return (
    <>
      <PageHero title={AMENITIES_PAGE.title} titleId="amenities-title" />
      {AMENITY_ROWS.map((amenity, index) => (
        <AmenityRow
          key={amenity.slug}
          amenity={amenity}
          reverse={index % 2 === 1}
        />
      ))}
      <AmenityHighlights />
    </>
  );
}
