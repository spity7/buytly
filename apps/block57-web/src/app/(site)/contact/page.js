import ContactMap from "@/components/block57/contact/ContactMap";
import ContactSection from "@/components/block57/contact/ContactSection";
import PageHero from "@/components/block57/ui/PageHero";
import { CONTACT_PAGE } from "@/content/block57/contact";
import { buildPageMetadata } from "@/lib/block57/seo";

export const metadata = buildPageMetadata({
  title: CONTACT_PAGE.title,
  description: CONTACT_PAGE.metaDescription,
  path: CONTACT_PAGE.path,
});

/**
 * /contact/ (WordPress URL kept; no nav link, as on live), statically
 * prerendered. Live order: global hero band, "Drop us a line" form + address
 * and general inquiries, the full-width map, then the footer (no pre-footer
 * tiles).
 */
export default function ContactPage() {
  return (
    <>
      <PageHero title={CONTACT_PAGE.title} titleId="contact-title" />
      <ContactSection />
      <ContactMap />
    </>
  );
}
