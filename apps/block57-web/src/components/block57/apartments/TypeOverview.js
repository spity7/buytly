import { Fragment } from "react";
import Image from "next/image";
import Container from "@/components/block57/ui/Container";
import Divider from "@/components/block57/ui/Divider";
import Section from "@/components/block57/ui/Section";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { ButtonLink } from "@/components/block57/ui/Button";
import { getAsset } from "@/lib/block57/assets";
import { getUnitTypeInquireHref } from "@/content/block57/unitTypes";
import { TYPE_PAGE_COPY } from "@/content/block57/apartments";
import styles from "./TypeOverview.module.scss";

/**
 * Type page overview (live template 4488): left half = title, description,
 * "With areas starting from" + range, and the two spec paragraphs between
 * green 1px dividers, closed by a #E3DCD9 column rule; right half = the
 * static floor plan at its natural ratio (never wider than its file).
 * Penthouse adds the black INQUIRE pill row below (→ /inquire/?type=…).
 *
 * The overview title is an <h2> (live: H3 styling, 48/48 → 36) so the page
 * outline has no skipped level.
 */
export default function TypeOverview({ type }) {
  const plan = getAsset(type.floorPlan);
  const titleId = "type-overview-title";

  return (
    <>
      <Section
        spacing="none"
        className={[
          styles.overview,
          type.showInquireRow ? styles.withInquireRow : null,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-labelledby={titleId}
      >
        <Container className={styles.row}>
          <div className={styles.text}>
            <h2 id={titleId} className={styles.title}>
              {type.overviewTitle}
            </h2>
            <p className={styles.description}>{type.description}</p>
            <div className={styles.specs}>
              <p>{TYPE_PAGE_COPY.areaLabel}</p>
              <p className={styles.areaValue}>{type.areaRange}</p>
              <Divider variant="green" />
              {type.specs.map((spec) => (
                <Fragment key={spec}>
                  <p className={styles.spec}>{spec}</p>
                  <Divider variant="green" />
                </Fragment>
              ))}
            </div>
          </div>

          <div className={styles.plan}>
            <Image
              src={plan.src}
              alt={plan.alt}
              width={plan.width}
              height={plan.height}
              sizes="(max-width: 767px) calc(100vw - 30px), (max-width: 1380px) calc(50vw - 60px), 630px"
              className={styles.planImage}
              style={{ maxWidth: `${plan.width}px` }}
            />
          </div>
        </Container>
      </Section>

      {type.showInquireRow ? (
        <Container className={styles.inquireRow}>
          <ButtonLink href={getUnitTypeInquireHref(type.slug)} variant="black">
            {TYPE_PAGE_COPY.inquire}
            <VisuallyHidden>{` about the ${type.label}`}</VisuallyHidden>
          </ButtonLink>
        </Container>
      ) : null}
    </>
  );
}
