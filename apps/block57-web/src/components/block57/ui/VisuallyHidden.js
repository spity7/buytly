import styles from "./VisuallyHidden.module.scss";

/** Text for screen readers only. */
export default function VisuallyHidden({
  as: Tag = "span",
  children,
  ...rest
}) {
  return (
    <Tag className={styles.hidden} {...rest}>
      {children}
    </Tag>
  );
}
