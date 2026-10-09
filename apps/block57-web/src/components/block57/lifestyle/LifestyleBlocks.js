import Image from "next/image";
import Reveal from "@/components/block57/ui/Reveal";
import { LIFESTYLE_BLOCKS } from "@/content/block57/lifestyle";
import { getAsset } from "@/lib/block57/assets";
import { LifestyleHeading } from "./LifestyleText";
import styles from "./LifestyleBlocks.module.scss";

function Block({ block }) {
  return (
    <p className={styles.copy}>
      <strong className={styles.name}>{block.name}</strong>
      <br />
      {block.text}
    </p>
  );
}

/**
 * lifestyle.blocks "Block Overview" (DESIGN_SPEC §4.2.4): left column =
 * eyebrow, H2, Block A and Block B behind a right hairline; right column = the
 * aerial photo (60vh, cover) and Block C. Phones show the photo first, then
 * the three blocks stacked (live hides Block A/B and the heading there, OQ-15).
 */
export default function LifestyleBlocks({ content = LIFESTYLE_BLOCKS }) {
  const image = getAsset(content.image);
  const [blockA, blockB, blockC] = content.blocks;

  return (
    <section className={styles.blocks} aria-labelledby="lifestyle-blocks-title">
      <div className={styles.inner}>
        <div className={styles.textColumn}>
          <div className={styles.textInner}>
            <LifestyleHeading
              eyebrow={content.eyebrow}
              title={content.title}
              id="lifestyle-blocks-title"
              effect="left"
            />
            <Reveal effect="left">
              <Block block={blockA} />
            </Reveal>
            <Reveal effect="left" className={styles.blockB}>
              <Block block={blockB} />
            </Reveal>
          </div>
        </div>

        <div className={styles.mediaColumn}>
          <Reveal effect="right" className={styles.media}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              // 16:9 photo cropped to the column × 60vh box.
              sizes="107vh"
              className={styles.image}
              style={{ backgroundColor: image.color }}
            />
          </Reveal>
          <Reveal effect="left" className={styles.blockC}>
            <Block block={blockC} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
