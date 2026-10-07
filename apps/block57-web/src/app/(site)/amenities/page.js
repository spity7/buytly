import AmenitiesIntro from "@/components/block57/amenities/AmenitiesIntro";
import AmenityGroup from "@/components/block57/amenities/AmenityGroup";
import CtaBand from "@/components/block57/ui/CtaBand";
import {
  AMENITIES_CTA,
  AMENITIES_PAGE,
  getAmenityGroups,
} from "@/content/block57/amenities";
import { buildPageMetadata } from "@/lib/block57/seo";

export const metadata = buildPageMetadata({
  title: "Amenities",
  description: AMENITIES_PAGE.metaDescription,
  path: "/amenities/",
});

/**
 * /amenities/ (WordPress URL kept). Fully static: verified copy for the seven
 * amenities, grouped visually, each with an anchor id (its slug). Light opening
 * section, so the header stays solid (no <HeaderOverlay />).
 */
export default function AmenitiesPage() {
  const groups = getAmenityGroups();
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const startIndexes = groups.map((_, index) =>
    groups.slice(0, index).reduce((sum, group) => sum + group.items.length, 0),
  );

  return (
    <>
      <AmenitiesIntro groups={groups} />
      {groups.map((group, index) => (
        <AmenityGroup
          key={group.slug}
          group={group}
          groupIndex={index}
          groupCount={groups.length}
          startIndex={startIndexes[index]}
          total={total}
          // Bands alternate alt / default after the default-tone intro.
          tone={index % 2 === 0 ? "alt" : "default"}
        />
      ))}
      <CtaBand id="amenities-cta" {...AMENITIES_CTA} />
    </>
  );
}
