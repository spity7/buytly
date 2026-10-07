import Reveal from "@/components/block57/ui/Reveal";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/block57/ui/icons";
import { INQUIRE_CONTACT } from "@/content/block57/inquire";
import { ADDRESS, CONTACT, WHATSAPP_MESSAGE } from "@/content/block57/site";
import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";
import styles from "./InquireContact.module.scss";

/** Sales contact details beside the form: phone, email, WhatsApp, address. */
export default function InquireContact({
  content = INQUIRE_CONTACT,
  titleId = "inquire-contact-title",
  className,
}) {
  const whatsappHref = buildWhatsAppUrl(CONTACT.phone, {
    text: WHATSAPP_MESSAGE,
  });

  const rows = [
    {
      key: "phone",
      label: content.labels.phone,
      icon: <PhoneIcon size={18} />,
      value: CONTACT.phoneDisplay,
      href: CONTACT.phoneHref,
    },
    {
      key: "email",
      label: content.labels.email,
      icon: <MailIcon size={18} />,
      value: CONTACT.email,
      href: CONTACT.emailHref,
    },
    whatsappHref
      ? {
          key: "whatsapp",
          label: content.labels.whatsapp,
          icon: <WhatsAppIcon size={17} />,
          value: content.whatsappValue,
          href: whatsappHref,
          external: true,
        }
      : null,
    {
      key: "visit",
      label: content.labels.visit,
      icon: <PinIcon size={18} />,
      value: (
        <>
          {ADDRESS.street}
          <br />
          {ADDRESS.locality}
        </>
      ),
    },
  ].filter(Boolean);

  return (
    <aside
      className={[styles.aside, className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <Reveal>
        <h2 id={titleId} className={styles.title}>
          {content.title}
        </h2>
        {content.lead ? <p className={styles.lead}>{content.lead}</p> : null}

        <address className={styles.contact}>
          <ul className={styles.list}>
            {rows.map((row) => (
              <li key={row.key} className={styles.row}>
                <span className={styles.icon}>{row.icon}</span>
                <span className={styles.label}>{row.label}</span>
                {row.href ? (
                  <a
                    href={row.href}
                    className={styles.value}
                    {...(row.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {row.value}
                    {row.external ? (
                      <span className={styles.srOnly}> {content.newTab}</span>
                    ) : null}
                  </a>
                ) : (
                  <span className={styles.value}>{row.value}</span>
                )}
              </li>
            ))}
          </ul>
        </address>
      </Reveal>
    </aside>
  );
}
