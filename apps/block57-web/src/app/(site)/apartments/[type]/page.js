import { notFound } from "next/navigation";
import AvailabilityTable from "@/components/block57/apartments/AvailabilityTable";
import OtherResidences from "@/components/block57/apartments/OtherResidences";
import TypeFloorPlans from "@/components/block57/apartments/TypeFloorPlans";
import TypeGallery from "@/components/block57/apartments/TypeGallery";
import TypeHeroFacts from "@/components/block57/apartments/TypeHeroFacts";
import TypeOverview from "@/components/block57/apartments/TypeOverview";
import CtaBand from "@/components/block57/ui/CtaBand";
import JsonLd from "@/components/block57/ui/JsonLd";
import PageHero from "@/components/block57/ui/PageHero";
import { ButtonLink } from "@/components/block57/ui/Button";
import {
  UNIT_TYPE_SLUGS,
  getUnitType,
  getUnitTypeHref,
  getUnitTypeInquireHref,
} from "@/content/block57/unitTypes";
import { APARTMENTS_CTA } from "@/content/block57/apartments";
import { SITE_NAME } from "@/content/block57/site";
import { absoluteUrl, buildPageMetadata } from "@/lib/block57/seo";

// The six residence types are prerendered; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return UNIT_TYPE_SLUGS.map((type) => ({ type }));
}

function describe(type) {
  return `${type.label} residences at ${SITE_NAME}, Cantonments, Accra. ${type.summary}`;
}

export async function generateMetadata({ params }) {
  const { type: slug } = await params;
  const type = getUnitType(slug);
  if (!type) return {};
  return buildPageMetadata({
    title: type.label,
    description: describe(type),
    path: getUnitTypeHref(type.slug),
  });
}

function breadcrumbJsonLd(type) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: SITE_NAME, path: "/" },
      { name: "Apartments", path: "/apartments/" },
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
 * /apartments/<type>/ — static copy, renders and plans from unitTypes.js; the
 * gallery fallback, unit floor plans and the availability table are LIVE
 * (client-side, React Query) because unit media URLs are signed for 1 hour.
 */
export default async function ApartmentTypePage({ params }) {
  const { type: slug } = await params;
  const type = getUnitType(slug);
  if (!type) notFound();

  return (
    <>
      <PageHero
        titleId="type-title"
        size="compact"
        breadcrumbs={[
          { href: "/apartments/", label: "Apartments" },
          { label: type.label },
        ]}
        title={type.label}
        lead={type.summary}
        image={type.heroImage}
        imageAlt={`${type.label} at Block 57`}
        facts={<TypeHeroFacts type={type} />}
        actions={
          <>
            <ButtonLink href="#availability">View availability</ButtonLink>
            <ButtonLink
              href={getUnitTypeInquireHref(type.slug)}
              variant="secondary"
            >
              Inquire
            </ButtonLink>
          </>
        }
      />

      <TypeOverview type={type} />
      <TypeGallery typeSlug={type.slug} />
      <TypeFloorPlans typeSlug={type.slug} />
      <AvailabilityTable typeSlug={type.slug} />
      <OtherResidences currentSlug={type.slug} />
      <CtaBand
        id="type-cta"
        {...APARTMENTS_CTA}
        title={`Inquire about ${type.pluralLabel}`}
        primary={{
          ...APARTMENTS_CTA.primary,
          href: getUnitTypeInquireHref(type.slug),
        }}
      />

      <JsonLd data={breadcrumbJsonLd(type)} />
    </>
  );
}
