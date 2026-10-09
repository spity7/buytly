import JsonLd from "@/components/block57/ui/JsonLd";
import {
  HomeAmenities,
  HomeContactStrip,
  HomeCta,
  HomeHero,
  HomeIntro,
  HomeMarquee,
  HomeTour,
  HomeUnits,
} from "@/components/block57/home";
import {
  buildApartmentComplexJsonLd,
  buildPageMetadata,
} from "@/lib/block57/seo";

// No title: the tab reads the live home title "Block 57 – Real estate Project".
export const metadata = buildPageMetadata({ path: "/" });

/**
 * Home ("/"), the live block-57.com home section by section. Statically
 * generated; the only live data is the availability line of each residence
 * card, fetched on the client.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeIntro />
      <HomeMarquee />
      <HomeUnits />
      <HomeTour />
      <HomeAmenities />
      <HomeContactStrip />
      <HomeCta />
      <JsonLd data={buildApartmentComplexJsonLd({ path: "/" })} />
    </>
  );
}
