import GalleryTabs from "@/components/block57/gallery/GalleryTabs";
import MasonryGrid from "@/components/block57/gallery/MasonryGrid";
import Container from "@/components/block57/ui/Container";
import PageHero from "@/components/block57/ui/PageHero";
import Section from "@/components/block57/ui/Section";
import { GALLERY_PAGE, GALLERY_TABS } from "@/content/block57/gallery";
import { getAsset } from "@/lib/block57/assets";
import { buildPageMetadata } from "@/lib/block57/seo";

const ogImage = getAsset(GALLERY_PAGE.ogImage);

export const metadata = buildPageMetadata({
  title: GALLERY_PAGE.title,
  description: GALLERY_PAGE.metaDescription,
  path: GALLERY_PAGE.path,
  image: {
    url: ogImage.src,
    width: ogImage.width,
    height: ogImage.height,
    alt: GALLERY_TABS[0].images[0].alt,
  },
});

/**
 * /gallery/ (WordPress URL kept), statically prerendered: global hero band,
 * then the Exterior (9) / Interior (16) tabs with their masonry grids, then
 * the footer (no pre-footer tiles). Live hides the tabs at ≤1366px (OQ-09):
 * here the gallery shows at every width (one column below 768px).
 */
export default function GalleryPage() {
  const tabs = GALLERY_TABS.map((tab) => ({
    slug: tab.slug,
    label: tab.label,
    content: (
      <MasonryGrid
        images={tab.images.map(({ id, alt }) => ({ ...getAsset(id), alt }))}
      />
    ),
  }));

  return (
    <>
      <PageHero title={GALLERY_PAGE.title} titleId="gallery-title" />
      <Section as="div">
        <Container>
          <GalleryTabs label={GALLERY_PAGE.label} tabs={tabs} />
        </Container>
      </Section>
    </>
  );
}
