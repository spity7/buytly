import Eyebrow from "./Eyebrow";
import styles from "./SectionHeading.module.scss";

/**
 * Eyebrow + section heading, as on the live sections: the heading sits 30px
 * under the eyebrow (15px ≤767) and has no bottom margin, so each section sets
 * its own (`className` on the wrapper: 25 / 30 / 50 …).
 *
 * @param {{ eyebrow?: React.ReactNode, title: React.ReactNode,
 *   as?: "h1"|"h2"|"h3", size?: "section"|"subsection",
 *   align?: "center"|"start", eyebrowVariant?: "text"|"widget",
 *   id?: string, className?: string, titleClassName?: string,
 *   children?: React.ReactNode }} props
 *   size: "section" = H2 role 60 → 54 → 48 → 36 (default for h2),
 *   "subsection" = H3 role 48 → 36 (default for h3). `id` goes on the heading
 *   (use it for `aria-labelledby` on the section).
 */
export default function SectionHeading({
  eyebrow,
  title,
  as: Heading = "h2",
  size = Heading === "h3" ? "subsection" : "section",
  align = "center",
  eyebrowVariant = "text",
  id,
  className,
  titleClassName,
  children,
}) {
  return (
    <div
      className={[styles.heading, styles[`align-${align}`], className]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <Eyebrow variant={eyebrowVariant}>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={[
          styles.title,
          styles[size],
          eyebrow ? styles.afterEyebrow : null,
          titleClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </Heading>
      {children}
    </div>
  );
}
