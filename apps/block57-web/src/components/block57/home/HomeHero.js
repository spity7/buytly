import HeaderOverlay from "@/components/block57/layout/HeaderOverlay";
import Container from "@/components/block57/ui/Container";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { ButtonLink } from "@/components/block57/ui/Button";
import { HOME_HERO } from "@/content/block57/home";
import HeroVideo from "./HeroVideo";
import styles from "./HomeHero.module.scss";

/**
 * Full-bleed opening hero under the transparent (overlay) header. Media is
 * video-ready: `HOME_HERO.media.video` (+ `poster`) plays a muted loop with a
 * pause control; a `poster` alone shows the still; neither shows the tonal
 * MediaFrame placeholder.
 */
export default function HomeHero({ content = HOME_HERO }) {
  const { media = {}, scrollCue } = content;

  return (
    <section
      className={styles.hero}
      data-b57-tone="dark"
      aria-labelledby="home-hero-title"
    >
      <HeaderOverlay />

      <div className={styles.media}>
        {media.video ? (
          <HeroVideo src={media.video} poster={media.poster} />
        ) : (
          <MediaFrame
            ratio="fill"
            tone="dark"
            src={media.poster}
            alt={media.alt}
            priority
          />
        )}
      </div>

      <Container className={styles.inner}>
        <h1 id="home-hero-title" className={styles.title}>
          {content.title}
        </h1>
        <p className={styles.lead}>{content.lead}</p>
        <div className={styles.actions}>
          <ButtonLink href={content.primaryCta.href}>
            {content.primaryCta.label}
          </ButtonLink>
          <ButtonLink href={content.secondaryCta.href} variant="secondary">
            {content.secondaryCta.label}
          </ButtonLink>
        </div>
      </Container>

      {scrollCue ? (
        <a href={scrollCue.href} className={styles.scrollCue}>
          <span className={styles.scrollLabel}>
            {scrollCue.label}
            {scrollCue.srLabel ? (
              <VisuallyHidden> {scrollCue.srLabel}</VisuallyHidden>
            ) : null}
          </span>
          <span className={styles.scrollLine} aria-hidden="true" />
        </a>
      ) : null}
    </section>
  );
}
