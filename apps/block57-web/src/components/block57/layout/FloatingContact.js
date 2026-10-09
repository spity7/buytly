import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";
import {
  CONTACT,
  INQUIRE_LINK,
  WHATSAPP_MESSAGE,
} from "@/content/block57/site";
import {
  ChatyLinkIcon,
  ChatyWhatsAppIcon,
} from "@/components/block57/ui/icons";
import styles from "./FloatingContact.module.scss";

/**
 * Live floating buttons (Chaty), always expanded, bottom right: WhatsApp
 * (#49E670) above Inquire (#202020, → /inquire/; broken on live). Each shows
 * its label in a tooltip bubble on hover/focus.
 */
export default function FloatingContact() {
  const whatsappHref = buildWhatsAppUrl(CONTACT.phone, {
    text: WHATSAPP_MESSAGE,
  });

  return (
    <div className={styles.stack}>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          className={`${styles.button} ${styles.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp (opens in a new tab)"
        >
          <ChatyWhatsAppIcon size={54} />
          <span className={styles.tooltip} aria-hidden="true">
            WhatsApp
          </span>
        </a>
      ) : null}
      <Link
        href={INQUIRE_LINK.href}
        className={`${styles.button} ${styles.inquire}`}
        aria-label={INQUIRE_LINK.label}
      >
        <ChatyLinkIcon size={54} />
        <span className={styles.tooltip} aria-hidden="true">
          {INQUIRE_LINK.label}
        </span>
      </Link>
    </div>
  );
}
