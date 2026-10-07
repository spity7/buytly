import Eyebrow from "./Eyebrow";
import styles from "./SectionHeading.module.scss";

/**
 * Eyebrow + heading + optional lead paragraph.
 * @param {{ eyebrow?: React.ReactNode, title: React.ReactNode, lead?: React.ReactNode,
 *   as?: "h1"|"h2"|"h3", align?: "start"|"center", size?: "default"|"large",
 *   id?: string, className?: string, children?: React.ReactNode }} props
 *   `id` goes on the heading (use it for `aria-labelledby` on the section).
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  align = "start",
  size = "default",
  id,
  className,
  children,
}) {
  return (
    <header
      className={[
        styles.heading,
        styles[`align-${align}`],
        styles[`size-${size}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <Eyebrow className={styles.eyebrow}>{eyebrow}</Eyebrow> : null}
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      {children}
    </header>
  );
}
