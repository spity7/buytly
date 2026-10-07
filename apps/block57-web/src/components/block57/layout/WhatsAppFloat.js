import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";
import { getPlatformSupportPhone } from "@/data/platformContact";
import { WHATSAPP_MESSAGE } from "@/content/block57/site";
import { WhatsAppIcon } from "@/components/block57/ui/icons";
import styles from "./WhatsAppFloat.module.scss";

/** Floating WhatsApp chat link (bottom right; hidden on very short viewports). */
export default function WhatsAppFloat() {
  const href = buildWhatsAppUrl(getPlatformSupportPhone(), {
    text: WHATSAPP_MESSAGE,
  });
  if (!href) return null;

  return (
    <a
      href={href}
      className={styles.float}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Block 57 on WhatsApp (opens in a new tab)"
    >
      <WhatsAppIcon size={24} />
    </a>
  );
}
