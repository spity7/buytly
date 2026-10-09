import PageHero from "@/components/block57/ui/PageHero";
import LifestyleBlocks from "@/components/block57/lifestyle/LifestyleBlocks";
import LifestyleIntro from "@/components/block57/lifestyle/LifestyleIntro";
import LifestyleSplit from "@/components/block57/lifestyle/LifestyleSplit";
import {
  LIFESTYLE_LOCATION,
  LIFESTYLE_PAGE,
  LIFESTYLE_PRIVACY,
} from "@/content/block57/lifestyle";
import { buildPageMetadata } from "@/lib/block57/seo";

export const metadata = buildPageMetadata({
  title: LIFESTYLE_PAGE.title,
  description: LIFESTYLE_PAGE.metaDescription,
  path: LIFESTYLE_PAGE.path,
});

/**
 * /life-style/ (WordPress URL kept), statically prerendered. Live section
 * order: global hero band, intro + counters + render, Location (static map),
 * Block Overview, Privacy Through Design, then the footer (no pre-footer
 * tiles). The hidden "The Views" slider and demo banners are not built.
 */
export default function LifestylePage() {
  return (
    <>
      <PageHero title={LIFESTYLE_PAGE.title} titleId="lifestyle-title" />
      <LifestyleIntro />
      <LifestyleSplit
        variant="location"
        id="lifestyle-location-title"
        content={LIFESTYLE_LOCATION}
      />
      <LifestyleBlocks />
      <LifestyleSplit
        variant="privacy"
        id="lifestyle-privacy-title"
        content={LIFESTYLE_PRIVACY}
      />
    </>
  );
}
