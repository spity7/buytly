import styles from "./Eyebrow.module.scss";

/** Small uppercase, letter-spaced label above a heading. */
export default function Eyebrow({
  as: Tag = "p",
  rule = false,
  className,
  children,
  ...rest
}) {
  if (!children) return null;
  return (
    <Tag
      className={[styles.eyebrow, rule ? styles.rule : null, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Tag>
  );
}
