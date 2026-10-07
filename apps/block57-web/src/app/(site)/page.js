import JsonLd from "@/components/block57/ui/JsonLd";
import {
  HomeAmenities,
  HomeHero,
  HomeInquire,
  HomeIntro,
  HomeLifestyle,
  HomeMasterplan,
  HomePrivacy,
  HomeResidences,
} from "@/components/block57/home";
import { HOME_META } from "@/content/block57/home";
import {
  buildApartmentComplexJsonLd,
  buildPageMetadata,
} from "@/lib/block57/seo";

const baseMetadata = buildPageMetadata({
  path: "/",
  description: HOME_META.description,
});

export const metadata = {
  ...baseMetadata,
  title: { absolute: HOME_META.title },
  openGraph: { ...baseMetadata.openGraph, title: HOME_META.title },
  twitter: { ...baseMetadata.twitter, title: HOME_META.title },
};

/**
 * Home ("/"). Statically generated: all copy is static; the only live data is
 * unit availability in the residences teaser, fetched on the client.
 * The hero renders <HeaderOverlay /> (transparent header over the hero).
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeIntro />
      <HomeMasterplan />
      <HomeResidences />
      <HomePrivacy />
      <HomeAmenities />
      <HomeLifestyle />
      <HomeInquire />
      <JsonLd data={buildApartmentComplexJsonLd({ path: "/" })} />
    </>
  );
}
