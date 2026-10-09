import styles from "./Container.module.scss";

/**
 * Centred content column with the site gutter (30px, 15px ≤767).
 * size (content width at desktop):
 * - "default" 1320 (boxed sections; content starts at x60 on a 1440 screen)
 * - "wide" 1350 with a fixed 15px padding (home tour + amenities)
 * - "cards" 1380 (amenities highlight cards) · "archive" 1290 + 15px padding
 *   (apartments index grid) · "narrow" 840 · "text" 520
 * - "chrome" 1730 (header and footer) · "full" no max width
 * @param {{ as?: string, size?: "default"|"wide"|"cards"|"archive"|"narrow"|"text"|"chrome"|"full",
 *   className?: string }} props
 */
export default function Container({
  as: Tag = "div",
  size = "default",
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={[styles.container, styles[size], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
