import { Suspense } from "react";
import Image from "next/image";
import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { INQUIRE_PAGE } from "@/content/block57/inquire";
import { getAsset } from "@/lib/block57/assets";
import InquireForm from "./InquireForm";
import InquireFormFromParams from "./InquireFormFromParams";
import styles from "./InquireSection.module.scss";

const portrait = getAsset(INQUIRE_PAGE.image);

/**
 * `inquire.form` (DESIGN_SPEC §4.7.2): full-bleed #F6F1EA band (150 → 100 →
 * 80 → 60), boxed 1320. Left half: intro + form; right half: the VV_10
 * portrait (565×989 at 1440), top-aligned with the intro, sliding in from the
 * right (opal-move-left, 1.25s; the band clips it at the viewport edge so the
 * page never scrolls sideways). Phones: form first, then the image.
 *
 * `?type=` / `?unit=` pre-fill the form on the client (useSearchParams inside
 * <Suspense>, so the page stays static); the fallback is the same form
 * without pre-fill, so nothing shifts.
 */
export default function InquireSection() {
  return (
    <Section as="div" tone="light" className={styles.band}>
      <Container className={styles.inner}>
        <div className={styles.formColumn}>
          <Suspense fallback={<InquireForm />}>
            <InquireFormFromParams />
          </Suspense>
        </div>
        <Reveal effect="left" fast={false} className={styles.imageColumn}>
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            sizes="(max-width: 767px) calc(100vw - 30px), (max-width: 1200px) calc(50vw - 60px), 565px"
            className={styles.image}
            style={{ backgroundColor: portrait.color }}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
