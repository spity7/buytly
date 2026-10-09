import Link from "next/link";
import {
  ADDRESS,
  CONTACT,
  FOOTER_COPYRIGHT,
  FOOTER_EXPLORE,
  INSTAGRAM_URL,
} from "@/content/block57/site";
import { ArrowTopIcon, InstagramIcon } from "@/components/block57/ui/icons";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import AccountLink from "./AccountLink";
import FloatingContact from "./FloatingContact";
import styles from "./Footer.module.scss";

const EXTERNAL_HREF = /^https?:/i;

function FooterLink({ href, label }) {
  if (EXTERNAL_HREF.test(href)) {
    return (
      <a
        href={href}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
        <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </a>
    );
  }
  return (
    <Link href={href} className={styles.link}>
      {label}
    </Link>
  );
}

/**
 * Live footer (server component, rendered once by the (site) layout): three
 * #1C322C bands — location / contact / Instagram, the "Explore" links, and the
 * copyright with "back to top". Phone and email are real links here (plain
 * text on live). Also renders the floating WhatsApp / Inquire buttons, so they
 * are inside the contentinfo landmark.
 */
export default function Footer() {
  return (
    <footer className={styles.footer} data-b57-tone="dark">
      <div className={styles.inner}>
        <div className={styles.contact}>
          <div className={styles.location}>
            <p className={styles.eyebrow}>location</p>
            <address className={styles.address}>
              {ADDRESS.street},
              <br />
              {ADDRESS.locality}
            </address>
          </div>
          <ul className={styles.reach}>
            <li>
              <a href={CONTACT.phoneHref} className={styles.reachLink}>
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={CONTACT.emailHref} className={styles.reachLink}>
                {CONTACT.email}
              </a>
            </li>
          </ul>
          <div className={styles.social}>
            <a
              href={INSTAGRAM_URL}
              className={styles.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (opens in a new tab)"
            >
              <InstagramIcon size={20} />
            </a>
          </div>
        </div>

        <nav className={styles.explore} aria-labelledby="b57-footer-explore">
          <h2 id="b57-footer-explore" className={styles.exploreTitle}>
            {FOOTER_EXPLORE.title}
          </h2>
          <div className={styles.lists}>
            {FOOTER_EXPLORE.lists.map((list, index) => (
              <ul key={index} className={styles.list}>
                {list.map((item) => (
                  <li key={item.href}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </nav>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{FOOTER_COPYRIGHT}</p>
          <div className={styles.bottomLinks}>
            <AccountLink className={styles.account} />
            <a href="#top" className={styles.backToTop}>
              <span className={styles.backToTopCircle} aria-hidden="true">
                <ArrowTopIcon size={12} />
              </span>
              back to top
            </a>
          </div>
        </div>
      </div>
      {/* Fixed bottom-right; inside the footer so it belongs to a landmark. */}
      <FloatingContact />
    </footer>
  );
}
