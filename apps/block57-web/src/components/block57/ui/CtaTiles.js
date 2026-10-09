import Image from "next/image";
import Link from "next/link";
import { getAsset } from "@/lib/block57/assets";
import { INQUIRE_LINK } from "@/content/block57/site";
import { MailInboxIcon } from "./icons";
import styles from "./CtaTiles.module.scss";

const TILES = [
  { href: "/amenities/", label: "Amenities", image: "img-025", tone: "slate" },
  { href: "/apartments/", label: "Apartments", image: "img-023", tone: "sage" },
];

/**
 * Pre-footer tiles of the apartments index and type pages (live template
 * 5238): two full-bleed 50% tiles, 300px tall (stacked 150px ≤767), whose
 * photo hides under a solid slate / sage overlay that turns into 40% black on
 * hover while the photo zooms to 1.09; a white INQUIRE badge sits on the seam.
 */
export default function CtaTiles() {
  return (
    <nav className={styles.tiles} aria-label="Explore Block 57">
      {TILES.map((tile) => {
        const image = getAsset(tile.image);
        return (
          <Link
            key={tile.href}
            href={tile.href}
            className={`${styles.tile} ${styles[tile.tone]}`}
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className={styles.image}
            />
            <span className={styles.overlay} aria-hidden="true" />
            <span className={styles.title}>{tile.label}</span>
          </Link>
        );
      })}
      <Link href={INQUIRE_LINK.href} className={styles.badge}>
        <MailInboxIcon size={40} className={styles.badgeIcon} />
        <span className={styles.badgeLabel}>inquire</span>
      </Link>
    </nav>
  );
}
