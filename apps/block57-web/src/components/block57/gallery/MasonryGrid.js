import ImageTile from "@/components/block57/ui/ImageTile";
import LightboxGallery from "@/components/block57/ui/LightboxGallery";
import styles from "./MasonryGrid.module.scss";

/**
 * `sizes` for a tile, from its slot in the live 12-item pattern (420×300
 * tiles at 1440; item 2 spans two rows: 420×630; items 7–8 span two
 * columns: 870×300) and the photo's ratio (it is cropped to cover the tile).
 * Phones: one column of 3:2 tiles.
 */
function tileSizes(image, index) {
  const slot = index % 12;
  const ratio = image.width / image.height;
  const tileWidth = slot === 6 || slot === 7 ? 870 : 420;
  const tileHeight = slot === 1 ? 630 : 300;
  const desktop = Math.max(tileWidth, Math.ceil(tileHeight * ratio));
  const phoneScale = Math.max(1, ratio / 1.5);
  const phone =
    phoneScale > 1
      ? `calc((100vw - 30px) * ${phoneScale.toFixed(2)})`
      : "calc(100vw - 30px)";
  return `(max-width: 767px) ${phone}, ${desktop}px`;
}

/**
 * One gallery tab (DESIGN_SPEC §4.6.2): dense 3-column masonry from 768px
 * (300px rows, 30px gaps, spans every 12 items), a single column of 3:2 tiles
 * below. Each tile opens the tab's own lightbox slideshow.
 *
 * @param {{ images: import("@/lib/block57/assets").Block57Asset[] }} props
 */
export default function MasonryGrid({ images }) {
  return (
    <LightboxGallery>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <ImageTile
            key={image.id}
            image={image}
            fit="cover"
            sizes={tileSizes(image, index)}
            className={styles.cell}
          />
        ))}
      </div>
    </LightboxGallery>
  );
}
