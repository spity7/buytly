import Link from "next/link";
import {
  ACCOUNT_LINKS,
  ADDRESS,
  CONTACT,
  INQUIRE_LINK,
  SITE_NAME,
  SITE_NAV,
  SITE_TAGLINE,
} from "@/content/block57/site";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/block57/ui/icons";
import Logo from "./Logo";
import WhatsAppFloat from "./WhatsAppFloat";
import styles from "./Footer.module.scss";

/**
 * Site footer (server component, rendered once by the (site) layout). Also
 * renders the fixed WhatsApp chat link, so it is inside the contentinfo
 * landmark.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-b57-tone="dark">
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo variant="light" className={styles.logo} />
            <p className={styles.tagline}>{SITE_TAGLINE}</p>
          </div>

          <div className={styles.columns}>
            <section
              className={styles.column}
              aria-labelledby="b57-footer-visit"
            >
              <h2 id="b57-footer-visit" className={styles.columnTitle}>
                Visit
              </h2>
              <address className={styles.address}>
                <PinIcon size={16} className={styles.icon} />
                <span>
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.locality}
                </span>
              </address>
            </section>

            <section
              className={styles.column}
              aria-labelledby="b57-footer-contact"
            >
              <h2 id="b57-footer-contact" className={styles.columnTitle}>
                Contact
              </h2>
              <ul className={styles.list}>
                <li>
                  <a href={CONTACT.phoneHref} className={styles.iconLink}>
                    <PhoneIcon size={16} className={styles.icon} />
                    {CONTACT.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={CONTACT.emailHref} className={styles.iconLink}>
                    <MailIcon size={16} className={styles.icon} />
                    {CONTACT.email}
                  </a>
                </li>
              </ul>
            </section>

            <nav className={styles.column} aria-labelledby="b57-footer-explore">
              <h2 id="b57-footer-explore" className={styles.columnTitle}>
                Explore
              </h2>
              <ul className={styles.list}>
                {[...SITE_NAV, INQUIRE_LINK].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} {SITE_NAME}
          </p>
          <ul className={styles.legal}>
            <li>
              <a href={ACCOUNT_LINKS.signIn.href} className={styles.link}>
                {ACCOUNT_LINKS.signIn.label}
              </a>
            </li>
            <li>
              <a
                href={`${ACCOUNT_LINKS.signIn.href}?auth=signup`}
                className={styles.link}
              >
                Create an account
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Fixed bottom-right; inside the footer so it belongs to a landmark. */}
      <WhatsAppFloat />
    </footer>
  );
}
