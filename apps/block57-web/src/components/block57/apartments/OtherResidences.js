import Link from "next/link";
import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { ArrowIcon } from "@/components/block57/ui/icons";
import {
  UNIT_TYPES,
  formatTypeBlocks,
  getUnitTypeHref,
} from "@/content/block57/unitTypes";
import { TYPE_PAGE_SECTIONS } from "@/content/block57/apartments";
import LiveAvailability from "@/components/block57/ui/LiveAvailability";
import styles from "./OtherResidences.module.scss";

/** Compact links to the other residence types (with live counts). */
export default function OtherResidences({ currentSlug }) {
  const others = UNIT_TYPES.filter((type) => type.slug !== currentSlug);
  return (
    <Section spacing="sm" aria-labelledby="other-residences-title">
      <Container>
        <SectionHeading
          eyebrow={TYPE_PAGE_SECTIONS.others.eyebrow}
          title={TYPE_PAGE_SECTIONS.others.title}
          id="other-residences-title"
        />
        <ul className={styles.list}>
          {others.map((type) => (
            <li key={type.slug}>
              <Link href={getUnitTypeHref(type.slug)} className={styles.link}>
                <span className={styles.label}>{type.label}</span>
                <span className={styles.blocks}>
                  {formatTypeBlocks(type.blocks)}
                </span>
                <LiveAvailability type={type.slug} className={styles.count} />
                <span className={styles.arrow} aria-hidden="true">
                  <ArrowIcon size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
