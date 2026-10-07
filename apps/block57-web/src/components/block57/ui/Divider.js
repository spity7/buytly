import styles from "./Divider.module.scss";

/**
 * Hairline rule. `spacing`: "none" | "sm" | "md" | "lg" vertical margin.
 * `decorative` hides it from assistive tech (default: true).
 */
export default function Divider({
  spacing = "md",
  decorative = true,
  className,
  ...rest
}) {
  return (
    <hr
      className={[styles.divider, styles[`spacing-${spacing}`], className]
        .filter(Boolean)
        .join(" ")}
      {...(decorative ? { "aria-hidden": "true" } : {})}
      {...rest}
    />
  );
}
