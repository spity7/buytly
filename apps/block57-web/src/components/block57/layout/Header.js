"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isPathActive } from "@/lib/url/normalizePath";
import { INQUIRE_LINK, SITE_NAV } from "@/content/block57/site";
import { ButtonLink } from "@/components/block57/ui/Button";
import { MenuIcon } from "@/components/block57/ui/icons";
import AccountMenu from "./AccountMenu";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import styles from "./Header.module.scss";

const MENU_ID = "b57-mobile-menu";
const SCROLL_SOLID_AT = 24; // px

/**
 * Site header (rendered once by the (site) layout).
 * - default: solid, sticky.
 * - overlay: transparent over a dark hero, solid after scrolling. A page opts
 *   in by rendering <HeaderOverlay /> (pure CSS via :has(), no flash).
 */
export default function Header() {
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_SOLID_AT);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close the drawer on navigation and when the viewport reaches desktop.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
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
      <header
        className={styles.header}
        data-scrolled={scrolled ? "true" : "false"}
        data-menu-open={menuOpen ? "true" : "false"}
      >
        <div className={styles.inner}>
          <Logo
            variant="auto"
            className={styles.logo}
            imageClassNames={{ dark: styles.logoDark, light: styles.logoLight }}
          />

          <nav aria-label="Main" className={styles.nav}>
            <ul className={styles.navList}>
              {SITE_NAV.map((item) => {
                const active = isPathActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions}>
            <AccountMenu className={styles.account} />
            <ButtonLink
              href={INQUIRE_LINK.href}
              size="sm"
              className={styles.cta}
              aria-current={
                isPathActive(pathname, INQUIRE_LINK.href) ? "page" : undefined
              }
            >
              {INQUIRE_LINK.label}
            </ButtonLink>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setMenuOpen(true)}
            >
              <span className={styles.menuLabel}>Menu</span>
              <MenuIcon size={22} />
            </button>
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
