import styles from "./Container.module.scss";

/**
 * Centred content column with the site gutter.
 * @param {{ as?: string, size?: "default"|"narrow"|"wide"|"full", className?: string }} props
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
