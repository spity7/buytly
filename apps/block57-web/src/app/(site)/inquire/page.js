import { Suspense } from "react";
import Container from "@/components/block57/ui/Container";
import PageHero from "@/components/block57/ui/PageHero";
import Section from "@/components/block57/ui/Section";
import InquireContact from "@/components/block57/inquire/InquireContact";
import InquireForm from "@/components/block57/inquire/InquireForm";
import InquireFormFromParams from "@/components/block57/inquire/InquireFormFromParams";
import { INQUIRE_PAGE } from "@/content/block57/inquire";
import { buildPageMetadata } from "@/lib/block57/seo";
import styles from "./page.module.scss";

export const metadata = buildPageMetadata({
  title: "Inquire",
  description: INQUIRE_PAGE.metaDescription,
  path: "/inquire/",
});

/**
 * /inquire/ (WordPress URL kept) — statically prerendered. `?type=` and
 * `?unit=` pre-fill the form on the client: <InquireFormFromParams> uses
 * useSearchParams inside <Suspense>, whose fallback is the same form without
 * pre-fill (identical layout, so nothing shifts). The hero renders
 * <HeaderOverlay /> (transparent header over the hero).
 */
export default function InquirePage() {
  return (
    <>
      <PageHero
        titleId="inquire-title"
        size="short"
        eyebrow={INQUIRE_PAGE.eyebrow}
        title={INQUIRE_PAGE.title}
        lead={INQUIRE_PAGE.intro}
        leadStyle="serif"
        image={INQUIRE_PAGE.heroImage}
        imageAlt={INQUIRE_PAGE.heroImageAlt}
      />
      <Section as="div" spacing="none" className={styles.body}>
        <Container>
          <div className={styles.grid}>
            <div className={styles.main}>
              <Suspense fallback={<InquireForm />}>
                <InquireFormFromParams />
              </Suspense>
            </div>
            <InquireContact className={styles.aside} />
          </div>
        </Container>
      </Section>
    </>
  );
}
