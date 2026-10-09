import { Suspense } from "react";
import ResidenceGrid from "@/components/block57/apartments/ResidenceGrid";
import UnitLinkResolver from "@/components/block57/apartments/UnitLinkResolver";
import Container from "@/components/block57/ui/Container";
import CtaTiles from "@/components/block57/ui/CtaTiles";
import PageHero from "@/components/block57/ui/PageHero";
import { getUnitType } from "@/content/block57/unitTypes";
import {
  APARTMENTS_INDEX_ORDER,
  APARTMENTS_PAGE,
} from "@/content/block57/apartments";
import { buildPageMetadata } from "@/lib/block57/seo";
import styles from "./page.module.scss";

export const metadata = buildPageMetadata({
  title: APARTMENTS_PAGE.title,
  description: APARTMENTS_PAGE.metaDescription,
  path: "/apartments/",
});

const INDEX_TYPES = APARTMENTS_INDEX_ORDER.map(getUnitType);

/**
 * /apartments/ (live post-type archive): hero band, the six apartment cards
 * (Penthouse → Executive Studio) with live availability, pre-footer tiles.
 * Statically prerendered; counts load on the client. `?unit=<id>` (legacy
 * /single-v1/:id/ links) is resolved on the client by <UnitLinkResolver>
 * inside <Suspense>, so the page itself stays static.
 */
export default function ApartmentsPage() {
  return (
    <>
      <PageHero
        variant="archive"
        title={APARTMENTS_PAGE.title}
        titleId="apartments-title"
      />

      <Container size="archive" className={styles.archive}>
        <Suspense fallback={null}>
          <UnitLinkResolver className={styles.notice} />
        </Suspense>
        <ResidenceGrid types={INDEX_TYPES} />
      </Container>

      <CtaTiles />
    </>
  );
}
