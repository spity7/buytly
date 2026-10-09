import styles from "./Section.module.scss";

/**
 * Page band: background tone + the live vertical rhythm.
 * tone: "default" (white) · "light" (#F6F1EA) · "green" (#346054, white text,
 *   headings, eyebrows and bars) · "dark" (#1C322C, white). The tone also
 *   switches the contextual colour tokens for everything inside
 *   (`data-b57-tone`).
 * spacing: "default" = padding-block 150 → 100 (≤1200) → 80 (≤1024) → 60
 *   (≤767) · "none" (the section sets its own padding/margins).
 *
 * @param {{ as?: string, tone?: "default"|"light"|"green"|"dark",
 *   spacing?: "default"|"none", className?: string, id?: string }} props
 */
export default function Section({
  as: Tag = "section",
  tone = "default",
  spacing = "default",
  className,
  children,
  ...rest
}) {
  const classes = [styles.section, styles[`spacing-${spacing}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes}
      data-b57-tone={tone === "default" ? undefined : tone}
      {...rest}
    >
      {children}
    </Tag>
  );
}
