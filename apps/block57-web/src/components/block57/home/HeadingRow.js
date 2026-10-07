import SectionHeading from "@/components/block57/ui/SectionHeading";
import { ButtonLink } from "@/components/block57/ui/Button";
import styles from "./HeadingRow.module.scss";

/** Section heading on the left with a "see all" text link aligned right (lg+). */
export default function HeadingRow({ eyebrow, title, lead, id, link }) {
  return (
    <div className={styles.row}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        id={id}
        className={styles.heading}
      />
      {link ? (
        <ButtonLink href={link.href} variant="text" className={styles.link}>
          {link.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
