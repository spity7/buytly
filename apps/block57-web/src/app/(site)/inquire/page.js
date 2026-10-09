import InquireSection from "@/components/block57/inquire/InquireSection";
import PageHero from "@/components/block57/ui/PageHero";
import { INQUIRE_PAGE } from "@/content/block57/inquire";
import { getAsset } from "@/lib/block57/assets";
import { buildPageMetadata } from "@/lib/block57/seo";

const ogImage = getAsset(INQUIRE_PAGE.image);

export const metadata = buildPageMetadata({
  title: INQUIRE_PAGE.title,
  description: INQUIRE_PAGE.metaDescription,
  path: INQUIRE_PAGE.path,
  image: {
    url: ogImage.src,
    width: ogImage.width,
    height: ogImage.height,
    alt: ogImage.alt,
  },
});

/**
 * /inquire/ (WordPress URL kept), statically prerendered. Live order: global
 * hero band, the #F6F1EA form band, then the footer (no pre-footer tiles; the
 * hidden FAQ accordion is not built). `?type=` and `?unit=` pre-fill the form
 * on the client.
 */
export default function InquirePage() {
  return (
    <>
      <PageHero title={INQUIRE_PAGE.title} titleId="inquire-title" />
      <InquireSection />
    </>
  );
}
