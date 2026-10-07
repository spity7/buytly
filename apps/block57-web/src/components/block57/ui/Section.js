import styles from "./Section.module.scss";

/**
 * Page band with vertical rhythm and an optional tone.
 * `tone="dark"` also flips the contextual colour tokens for everything inside
 * (headings, eyebrows, buttons, rules) via `data-b57-tone`.
 *
 * @param {{ as?: string, tone?: "default"|"alt"|"surface"|"dark",
 *   spacing?: "default"|"sm"|"lg"|"none", divider?: boolean,
 *   className?: string, id?: string }} props
 */
export default function Section({
  as: Tag = "section",
  tone = "default",
  spacing = "default",
  divider = false,
  className,
  children,
  ...rest
}) {
  const classes = [
    styles.section,
    styles[`tone-${tone}`],
    styles[`spacing-${spacing}`],
    divider ? styles.divider : null,
    className,
  ]
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
