import Reveal from "@/components/block57/ui/Reveal";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { ButtonLink } from "@/components/block57/ui/Button";
import { HOME_HERO } from "@/content/block57/home";
import { getAsset } from "@/lib/block57/assets";
import HeroVideo from "./HeroVideo";
import styles from "./HomeHero.module.scss";

/**
 * Live home hero: full-bleed background film under a 40% overlay, the
 * Montserrat tagline and the thick outline LEARN MORE pill, centred
 * (1080px tall → 900 / 800 / 700 / 600 / 500 at the live breakpoints). The
 * header overlays its top. Live has no visible H1, so the page heading is
 * visually hidden.
 */
export default function HomeHero({ content = HOME_HERO }) {
  const { video } = content;
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <HeroVideo
        youtubeId={video.youtubeId}
        poster={getAsset(video.poster)}
        pauseLabel={video.pauseLabel}
        playLabel={video.playLabel}
      />
      <div className={styles.inner}>
        <VisuallyHidden as="h1" id="home-title">
          {content.title}
        </VisuallyHidden>
        <Reveal as="p" className={styles.tagline}>
          {content.tagline}
        </Reveal>
        <Reveal>
          <ButtonLink
            href={content.cta.href}
            variant="outlineThick"
            className={styles.cta}
          >
            {content.cta.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
