"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { isPathActive } from "@/lib/url/normalizePath";
import { SITE_NAV } from "@/content/block57/site";
import { TimesIcon } from "@/components/block57/ui/icons";
import AccountLink from "./AccountLink";
import Logo from "./Logo";
import useScrollLock from "./useScrollLock";
import styles from "./MobileMenu.module.scss";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Live off-canvas drawer (≤1024px): a 330px white panel (410px at 768–1024)
 * sliding in from the left over a 70% black backdrop, dark logo, × close and
 * the five nav links (black, current/hover green), plus the account entry as
 * the last item. Modal dialog semantics: focus moves in on open, Tab is
 * trapped, Escape / backdrop / close button close it, focus returns to the
 * burger, and page scroll is locked.
 */
export default function MobileMenu({
  id,
  open,
  onClose,
  pathname,
  returnFocusRef,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const wasOpen = useRef(false);

  useScrollLock(open);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
      return undefined;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      returnFocusRef?.current?.focus();
    }
    return undefined;
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={styles.root}
      data-open={open ? "true" : "false"}
      data-b57-modal={open ? "open" : undefined}
      inert={!open}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        id={id}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close menu"
        >
          <TimesIcon size={24} />
        </button>

        <Logo variant="dark" className={styles.logo} onClick={onClose} />

        <nav aria-label="Main" className={styles.nav}>
          <ul>
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={
                    isPathActive(pathname, item.href) ? "page" : undefined
                  }
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <AccountLink className={`${styles.link} ${styles.account}`} />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
