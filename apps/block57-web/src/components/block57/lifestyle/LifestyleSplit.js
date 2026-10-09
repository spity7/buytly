import Image from "next/image";
import Reveal from "@/components/block57/ui/Reveal";
import { getAsset } from "@/lib/block57/assets";
import { LifestyleHeading, Lines } from "./LifestyleText";
import styles from "./LifestyleSplit.module.scss";

const IMAGE_SIZES = {
  // Square map cropped to the column × 80vh box: its width follows the height.
  location: "80vh",
  privacy: "(max-width: 767px) calc(100vw - 30px), 645px",
};

/**
 * Boxed image + text row of /life-style/ (DESIGN_SPEC §4.2.3 Location and
 * §4.2.5 Privacy Through Design): image on the left (enters from the right),
 * text column on the right behind a hairline, vertically centred (enters from
 * the left). Stacked on phones, image first, with a bottom hairline.
 * variant "location": static map cropped to 80vh; "privacy": natural ratio.
 *
 * @param {{ variant: "location"|"privacy", id: string,
 *   content: { eyebrow: string, title: string, lines: string[],
 *   image: string, imageAlt?: string } }} props
 */
export default function LifestyleSplit({ variant, id, content }) {
  const image = getAsset(content.image);

  return (
    <section
      className={[styles.split, styles[variant]].join(" ")}
      aria-labelledby={id}
    >
      <div className={styles.inner}>
        <Reveal effect="left" className={styles.media}>
          <Image
            src={image.src}
            alt={content.imageAlt ?? image.alt}
            width={image.width}
            height={image.height}
            sizes={IMAGE_SIZES[variant]}
            className={styles.image}
            style={{ backgroundColor: image.color }}
          />
        </Reveal>
        <div className={styles.text}>
          <LifestyleHeading
            eyebrow={content.eyebrow}
            title={content.title}
            id={id}
          />
          <Reveal effect="right">
            <p className={styles.copy}>
              <Lines lines={content.lines} />
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
