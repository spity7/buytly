import Eyebrow from "@/components/block57/ui/Eyebrow";
import { CONTACT_DETAILS } from "@/content/block57/contact";
import { CONTACT } from "@/content/block57/site";
import styles from "./ContactDetails.module.scss";

/**
 * Right column of `contact.form`: BUILDING ADDRESS and GENERAL INQUIRIES
 * labels (eyebrows without the bar) over H5-sized details. Phone and email are
 * real tel:/mailto: links (plain text on live), same look; the email keeps
 * the live 1px underline.
 */
export default function ContactDetails({ className }) {
  return (
    <div className={className}>
      <Eyebrow as="h2" bar={false} className={styles.label}>
        {CONTACT_DETAILS.addressLabel}
      </Eyebrow>
      <p className={`${styles.value} ${styles.address}`}>
        {CONTACT_DETAILS.address}
      </p>

      <Eyebrow as="h2" bar={false} className={styles.label}>
        {CONTACT_DETAILS.inquiriesLabel}
      </Eyebrow>
      <p className={styles.value}>
        <a href={CONTACT.phoneHref} className={styles.link}>
          {CONTACT_DETAILS.phoneDisplay}
        </a>
        <br />
        <a
          href={CONTACT.emailHref}
          className={`${styles.link} ${styles.email}`}
        >
          {CONTACT.email}
        </a>
      </p>
    </div>
  );
}
