"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isPathActive } from "@/lib/url/normalizePath";
import { BROCHURE_LINK, INQUIRE_LINK, SITE_NAV } from "@/content/block57/site";
import { ButtonLink } from "@/components/block57/ui/Button";
import { BarsIcon } from "@/components/block57/ui/icons";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import styles from "./Header.module.scss";

const MENU_ID = "b57-mobile-menu";
// The burger and drawer exist up to the live "tablet" breakpoint (1024px).
const DESKTOP_NAV_QUERY = "(min-width: 1025px)";

/**
 * Site header (rendered once by the (site) layout), as on block-57.com:
 * absolutely positioned and transparent over the page's dark hero, white
 * content, not sticky (it scrolls away with the page). Logo · centred nav
 * (label-swap hover) · BROCHURE outline pill + INQUIRE white pill. At ≤1024px
 * the nav moves into the drawer behind the burger; at ≤767px INQUIRE hides.
 * Every page therefore starts with a dark hero band.
 */
export default function Header() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  // Close the drawer on navigation and when the viewport reaches desktop.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_NAV_QUERY);
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.inner}>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <BarsIcon size={20} />
          </button>

          <Logo priority className={styles.logo} />

          <nav aria-label="Main" className={styles.nav}>
            <ul className={styles.navList}>
              {SITE_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={
                      isPathActive(pathname, item.href) ? "page" : undefined
                    }
                  >
                    <span className={styles.navTitle} data-name={item.label}>
                      <span className={styles.navText}>{item.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <span className={styles.slot}>
              <ButtonLink
                href={BROCHURE_LINK.href}
                external
                variant="outlineThin"
                className={styles.brochure}
              >
                {BROCHURE_LINK.label}
              </ButtonLink>
            </span>
            <span className={`${styles.slot} ${styles.inquireSlot}`}>
              <ButtonLink
                href={INQUIRE_LINK.href}
                variant="white"
                className={styles.inquire}
                aria-current={
                  isPathActive(pathname, INQUIRE_LINK.href) ? "page" : undefined
                }
              >
                {INQUIRE_LINK.label}
              </ButtonLink>
            </span>
          </div>
        </div>
      </header>
      <MobileMenu
        id={MENU_ID}
        open={menuOpen}
        onClose={closeMenu}
        pathname={pathname}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}
