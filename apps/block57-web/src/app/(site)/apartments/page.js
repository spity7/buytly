import { Suspense } from "react";
import BlockSection from "@/components/block57/apartments/BlockSection";
import MasterplanSection from "@/components/block57/apartments/MasterplanSection";
import ResidenceGrid from "@/components/block57/apartments/ResidenceGrid";
import UnitLinkResolver from "@/components/block57/apartments/UnitLinkResolver";
import CtaBand from "@/components/block57/ui/CtaBand";
import PageHero from "@/components/block57/ui/PageHero";
import {
  APARTMENTS_CTA,
  APARTMENTS_PAGE,
  BLOCKS,
} from "@/content/block57/apartments";
import { buildPageMetadata } from "@/lib/block57/seo";

export const metadata = buildPageMetadata({
  title: "Apartments",
  description: APARTMENTS_PAGE.metaDescription,
  path: "/apartments/",
});

/**
 * /apartments/ — statically prerendered. Live counts load on the client.
 * `?unit=<id>` (legacy /single-v1/:id/ links) is resolved on the client by
 * <UnitLinkResolver> inside <Suspense>, so the page itself stays static.
 */
export default function ApartmentsPage() {
  return (
    <>
      <PageHero
        titleId="apartments-title"
        eyebrow={APARTMENTS_PAGE.eyebrow}
        title={APARTMENTS_PAGE.title}
        lead={APARTMENTS_PAGE.intro[0]}
        image={APARTMENTS_PAGE.heroImage}
        imageAlt={APARTMENTS_PAGE.heroImageAlt}
        sectionNav={APARTMENTS_PAGE.sectionNav}
        notice={
          <Suspense fallback={null}>
            <UnitLinkResolver />
          </Suspense>
        }
      />

      <MasterplanSection />

      {BLOCKS.map((block, index) => (
        <BlockSection key={block.id} block={block} index={index} />
      ))}

      <ResidenceGrid />

      <CtaBand id="apartments-cta" {...APARTMENTS_CTA} />
    </>
  );
}
