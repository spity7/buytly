import CtaBand from "@/components/block57/ui/CtaBand";
import PageHero from "@/components/block57/ui/PageHero";
import LifestyleStory from "@/components/block57/lifestyle/LifestyleStory";
import LocationSection from "@/components/block57/lifestyle/LocationSection";
import NeighbourhoodList from "@/components/block57/lifestyle/NeighbourhoodList";
import {
  LIFESTYLE_CTA,
  LIFESTYLE_HERO,
  LIFESTYLE_PAGE,
} from "@/content/block57/lifestyle";
import { buildPageMetadata } from "@/lib/block57/seo";

export const metadata = buildPageMetadata({
  title: "Lifestyle",
  description: LIFESTYLE_PAGE.metaDescription,
  path: "/life-style/",
});

/**
 * /life-style/ (WordPress URL kept). Statically prerendered: all copy is
 * static; the map pin comes from the project's location, loaded on the client
 * (falls back to the approximate coordinates in content/block57/site.js).
 * The hero renders <HeaderOverlay /> (transparent header over the hero).
 */
export default function LifestylePage() {
  return (
    <>
      <PageHero
        titleId="lifestyle-title"
        eyebrow={LIFESTYLE_HERO.eyebrow}
        title={LIFESTYLE_HERO.title}
        lead={LIFESTYLE_HERO.lead}
        leadStyle="serif"
        image={LIFESTYLE_HERO.media?.src}
        imageAlt={LIFESTYLE_HERO.media?.alt}
        sectionNav={LIFESTYLE_HERO.sectionNav}
      />
      <LifestyleStory />
      <NeighbourhoodList />
      <LocationSection />
      <CtaBand id="lifestyle-cta" {...LIFESTYLE_CTA} />
    </>
  );
}
