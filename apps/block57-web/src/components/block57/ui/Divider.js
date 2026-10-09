import styles from "./Divider.module.scss";

/**
 * Live dividers (decorative, hidden from assistive tech):
 * - "hairline": 1px #E3DCD9, no margin
 * - "green": 1px #346054 with 15px above and below (type overview spec block)
 * - "white": 1px #FFF with 40px above and below, 20px ≤767 (home intro)
 */
export default function Divider({ variant = "hairline", className, ...rest }) {
  return (
    <hr
      className={[styles.divider, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      {...rest}
    />
  );
}
