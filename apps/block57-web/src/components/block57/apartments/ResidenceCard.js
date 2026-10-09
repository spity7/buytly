import Image from "next/image";
import Link from "next/link";
import LiveAvailability from "@/components/block57/ui/LiveAvailability";
import MetaPill from "@/components/block57/ui/MetaPill";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { ArrowRightBtnIcon } from "@/components/block57/ui/icons";
import { getAsset } from "@/lib/block57/assets";
import { getUnitTypeHref } from "@/content/block57/unitTypes";
import { RESIDENCE_CARD_COPY as COPY } from "@/content/block57/apartments";
import styles from "./ResidenceCard.module.scss";

/** Image `sizes` of a card in the /apartments/ grid (390px columns). */
export const RESIDENCE_CARD_SIZES =
  "(max-width: 767px) calc(100vw - 30px), (max-width: 1024px) calc(50vw - 45px), 390px";

/**
 * Live apartment card (home "Find your fit" and /apartments/): photo in a
 * 74.3% box (cover), centred H-title 28/36 #346054 (#000 on hover), the
 * `BED n · BATH n` meta pill and, under it, the live availability line. On
 * hover a black 119px "EXPLORE →" circle scales in over the photo (also while
 * the title link has focus).
 *
 * The title link is the card's only tab stop; the photo repeats it for the
 * mouse (hidden from assistive tech). Grid lines and spacing belong to the
 * parent (see ResidenceGrid).
 *
 * @param {{ type: object, headingAs?: "h2"|"h3"|"h4", sizes?: string,
 *   showAvailability?: boolean, className?: string }} props
 *   `type`: an entry of UNIT_TYPES (content/block57/unitTypes.js).
 *   `headingAs`: semantic level of the title (styling is the same).
 *   `sizes`: image sizes for the column width (default: the /apartments/
 *   grid; the home grid's 420px columns want
 *   "(max-width: 767px) calc(100vw - 30px), (max-width: 1024px) calc(50vw - 45px), 420px").
 */
export default function ResidenceCard({
  type,
  headingAs: Heading = "h2",
  sizes = RESIDENCE_CARD_SIZES,
  showAvailability = true,
  className,
}) {
  const image = getAsset(type.image);
  const href = getUnitTypeHref(type.slug);

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <Link
        href={href}
        className={styles.media}
        style={{ backgroundColor: image.color }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={image.src}
          alt=""
          fill
          sizes={sizes}
          className={styles.image}
        />
        <span className={styles.explore}>
          <span>{COPY.explore}</span>
          <ArrowRightBtnIcon
            size={16}
            className={styles.arrow}
            pathClassNames={[styles.arrowOut, styles.arrowIn]}
          />
        </span>
      </Link>

      <div className={styles.content}>
        <Heading className={styles.title}>
          <Link href={href} className={styles.titleLink}>
            {type.label}
          </Link>
        </Heading>
        <p className={styles.meta}>
          <MetaPill
            items={[
              { label: COPY.bed, value: type.beds },
              { label: COPY.bath, value: type.baths },
            ]}
            aria-hidden="true"
          />
          <VisuallyHidden>
            {`${COPY.bed} ${type.beds}, ${COPY.bath} ${type.baths}`}
          </VisuallyHidden>
        </p>
        {showAvailability ? (
          <p className={styles.availability}>
            <LiveAvailability type={type.catalogValue} />
          </p>
        ) : null}
      </div>
    </article>
  );
}
