import { Fragment } from "react";
import styles from "./MetaPill.module.scss";

/**
 * Meta pill of the apartment cards: `BED 1 · BATH 2` (labels #ADA4A1, values
 * #000, "·" separators), 34px tall, 1px #E3DCD9 border, radius 20. Also the
 * base for status/availability pills: pass `children` instead of `items`.
 *
 * @param {{ items?: { label: React.ReactNode, value?: React.ReactNode }[],
 *   as?: string, className?: string, children?: React.ReactNode }} props
 */
export default function MetaPill({
  items,
  as: Tag = "span",
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={[styles.pill, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {items
        ? items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 ? (
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
              ) : null}
              <span className={styles.item}>
                <span className={styles.label}>{item.label}</span>
                {item.value != null ? (
                  <span className={styles.value}>{item.value}</span>
                ) : null}
              </span>
            </Fragment>
          ))
        : children}
    </Tag>
  );
}
