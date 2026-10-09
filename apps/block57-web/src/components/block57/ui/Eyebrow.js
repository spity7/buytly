import styles from "./Eyebrow.module.scss";

/**
 * Section kicker: URW 12px, 2px tracking, uppercase, #000 (white inside a
 * green/dark tone) over a 5px #BDCACB bar exactly as wide as the text.
 * variant:
 * - "text" (home sections): line 18.67px, bar 22px below the text, 45.67px box
 * - "widget" (Lifestyle, Amenities): line 12px, padding 8/0/5, 30px box
 * `bar={false}`: no bar (contact page labels).
 * It is inline-block (the bar hugs the text), so the parent's text-align
 * places it.
 */
export default function Eyebrow({
  as: Tag = "p",
  variant = "text",
  bar = true,
  className,
  children,
  ...rest
}) {
  if (!children) return null;
  return (
    <Tag
      className={[
        styles.eyebrow,
        styles[variant],
        bar ? styles.bar : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
