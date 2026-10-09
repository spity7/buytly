import { notFound } from "next/navigation";
import AvailabilityTable from "@/components/block57/apartments/AvailabilityTable";
import TypeOverview from "@/components/block57/apartments/TypeOverview";
import TypePhotos from "@/components/block57/apartments/TypePhotos";
import TypeTour from "@/components/block57/apartments/TypeTour";
import CtaTiles from "@/components/block57/ui/CtaTiles";
import JsonLd from "@/components/block57/ui/JsonLd";
import PageHero from "@/components/block57/ui/PageHero";
import {
  UNIT_TYPE_SLUGS,
  getUnitType,
  getUnitTypeHref,
} from "@/content/block57/unitTypes";
import { APARTMENTS_PAGE } from "@/content/block57/apartments";
import { SITE_NAME } from "@/content/block57/site";
import { getAsset } from "@/lib/block57/assets";
import { leadingSentences } from "@/lib/block57/format";
import { absoluteUrl, buildPageMetadata } from "@/lib/block57/seo";

// The six residence types are prerendered under their live slugs; any other
// slug is a 404 (the old app slugs one-bedroom / two-bedroom are 301s in
// next.config.js).
export const dynamicParams = false;

export function generateStaticParams() {
  return UNIT_TYPE_SLUGS.map((type) => ({ type }));
}

/** Derived meta description: area range + the opening of the live copy. */
function describe(type) {
  return `${type.label} at ${SITE_NAME}, Cantonments, Accra: ${type.areaRange} ${leadingSentences(type.description)}`;
}

function shareImage({ src, width, height, alt }) {
  return { url: src, width, height, alt };
}

export async function generateMetadata({ params }) {
  const { type: slug } = await params;
  const type = getUnitType(slug);
  if (!type) return {};
  return buildPageMetadata({
    title: type.label,
    description: describe(type),
    path: getUnitTypeHref(type.slug),
    image: shareImage(getAsset(type.image)),
  });
}

function breadcrumbJsonLd(type) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", path: "/" },
      { name: APARTMENTS_PAGE.title, path: "/apartments/" },
      { name: type.label, path: getUnitTypeHref(type.slug) },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * /apartments/<slug>/ (live template 4488): hero band with the type's photo
 * and the 4-level breadcrumb, overview + floor plan, [Penthouse INQUIRE row],
 * [360 tour], "Apartment photos", then the LIVE availability table
 * (client-side) and the pre-footer tiles. Everything but the table is static.
 */
export default async function ApartmentTypePage({ params }) {
  const { type: slug } = await params;
  const type = getUnitType(slug);
  if (!type) notFound();

  return (
    <>
      <PageHero
        variant="type"
        title={type.label}
        titleId="type-title"
        image={getAsset(type.image)}
        breadcrumbs={[
          { href: "/apartments/", label: APARTMENTS_PAGE.title },
          // Live links the category archive, now a 301 to this page (OQ-25).
          { label: type.categoryName },
          { label: type.label },
        ]}
      />

      <TypeOverview type={type} />
      {type.tourId ? <TypeTour type={type} /> : null}
      <TypePhotos type={type} />
      <AvailabilityTable type={type} />
      <CtaTiles />

      <JsonLd data={breadcrumbJsonLd(type)} />
    </>
  );
}
