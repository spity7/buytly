import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import { ButtonLink } from "@/components/block57/ui/Button";
import { HOME_LIFESTYLE } from "@/content/block57/home";
import { LIFESTYLE_INTRO, LIFESTYLE_PAGE } from "@/content/block57/lifestyle";
import styles from "./HomeLifestyle.module.scss";

/** Split band: full-bleed neighbourhood image + one verified paragraph. */
export default function HomeLifestyle({ content = HOME_LIFESTYLE }) {
  return (
    <Section
      spacing="none"
      className={styles.band}
      aria-labelledby="home-lifestyle-title"
    >
      <div className={styles.split}>
        <Reveal className={styles.media}>
          <MediaFrame
            ratio="fill"
            tone="stone"
            src={content.media.src}
            alt={content.media.alt}
            caption={content.media.caption}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </Reveal>
        <div className={styles.body}>
          <Reveal className={styles.bodyInner} delay={120}>
            <SectionHeading
              eyebrow={LIFESTYLE_PAGE.eyebrow}
              title={LIFESTYLE_PAGE.title}
              id="home-lifestyle-title"
              className={styles.heading}
            />
            <p className={styles.copy}>{LIFESTYLE_INTRO[0]}</p>
            <ButtonLink href={content.cta.href} variant="text">
              {content.cta.label}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
