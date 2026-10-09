import Image from "next/image";
import Reveal from "@/components/block57/ui/Reveal";
import { HOME_CTA } from "@/content/block57/home";
import { getAsset } from "@/lib/block57/assets";
import ScheduleTourPopup from "./ScheduleTourPopup";
import styles from "./HomeCta.module.scss";

/**
 * "Home is waiting for you here": travertine render (cover) under a 40%
 * overlay, the two-line H2 and the SCHEDULE A TOUR pill that opens the tour
 * popup. The whole band enters with opal move-up, as on live.
 */
export default function HomeCta({ content = HOME_CTA }) {
  const background = getAsset(content.background);
  const [first, second] = content.titleLines;
  return (
    <Reveal
      as="section"
      className={styles.cta}
      aria-labelledby="home-cta-title"
    >
      <Image
        src={background.src}
        alt=""
        fill
        sizes="100vw"
        className={styles.background}
        style={{ backgroundColor: background.color }}
      />
      <div className={styles.inner}>
        <h2 id="home-cta-title" className={styles.title}>
          <span className={styles.line}>{first}</span>{" "}
          <span className={styles.line}>{second}</span>
        </h2>
        <ScheduleTourPopup label={content.button} className={styles.button} />
      </div>
    </Reveal>
  );
}
