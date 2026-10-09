import ResidenceCard, { RESIDENCE_CARD_SIZES } from "./ResidenceCard";
import styles from "./ResidenceGrid.module.scss";

/**
 * Live apartment-card grid: 3 columns (2 ≤1024, 1 ≤767) with #E3DCD9
 * hairlines only *between* cards: a vertical line centred in each column gap
 * (card-tall) and a horizontal line across the grid `gutter` px above every
 * row. Each card also keeps `gutter` px below it, as on live.
 *
 * - /apartments/: gutter 60 in the 1290px archive container → 390px cards.
 * - Home "Find your fit": gutter 30 in the 1320px container → 420px cards
 *   (pass the matching `sizes`, see ResidenceCard).
 *
 * @param {{ types: object[], gutter?: 30|60, headingAs?: "h2"|"h3"|"h4",
 *   sizes?: string, className?: string }} props
 *   `types`: UNIT_TYPES entries in display order.
 */
export default function ResidenceGrid({
  types,
  gutter = 60,
  headingAs = "h2",
  sizes = RESIDENCE_CARD_SIZES,
  className,
}) {
  return (
    <ul
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={{ "--_gutter": `${gutter}px` }}
    >
      {types.map((type) => (
        <li key={type.slug} className={styles.item}>
          <ResidenceCard type={type} headingAs={headingAs} sizes={sizes} />
        </li>
      ))}
    </ul>
  );
}
