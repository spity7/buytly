import Image from "next/image";
import { ButtonLink } from "@/components/block57/ui/Button";
import Reveal from "@/components/block57/ui/Reveal";
import { LIFESTYLE_INTRO } from "@/content/block57/lifestyle";
import { getAsset } from "@/lib/block57/assets";
import { LifestyleHeading, Lines } from "./LifestyleText";
import Odometer from "./Odometer";
import styles from "./LifestyleIntro.module.scss";

/**
 * lifestyle.intro (DESIGN_SPEC §4.2.2): not boxed. Row 1 = text column (50%)
 * + three counter columns (15% each) with hairline rules; row 2 = the render
 * at natural ratio, bleeding to the right edge of the viewport. The left edge
 * follows the 1320 grid.
 */
export default function LifestyleIntro({ content = LIFESTYLE_INTRO }) {
  const image = getAsset(content.image);

  return (
    <section className={styles.intro} aria-labelledby="lifestyle-intro-title">
      <div className={styles.text}>
        <LifestyleHeading
          eyebrow={content.eyebrow}
          title={content.title}
          id="lifestyle-intro-title"
        />
        <Reveal effect="right">
          <p className={styles.copy}>
            <Lines lines={content.lines} />
          </p>
        </Reveal>
        <Reveal effect="right" className={styles.linkRow}>
          <ButtonLink href={content.link.href} variant="textLink">
            {content.link.label}
          </ButtonLink>
        </Reveal>
      </div>

      <ul className={styles.counters}>
        {content.counters.map((counter, index) => (
          <Reveal
            as="li"
            key={counter.label}
            delay={index * 300}
            className={styles.counter}
          >
            <Odometer value={counter.value} className={styles.number} />
            <p className={styles.label}>{counter.label}</p>
          </Reveal>
        ))}
      </ul>

      <div className={styles.media}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 767px) calc(100vw - 15px), (max-width: 1366px) calc(100vw - 30px), calc(100vw - 60px)"
          className={styles.image}
          style={{ backgroundColor: image.color }}
        />
      </div>
    </section>
  );
}
