"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAuthSafe } from "@/providers/AuthProvider";
import { notifySuccess } from "@/lib/toast";
import { isPathActive } from "@/lib/url/normalizePath";
import {
  ACCOUNT_LINKS,
  ADDRESS,
  CONTACT,
  INQUIRE_LINK,
  SITE_NAV,
} from "@/content/block57/site";
import { ButtonLink } from "@/components/block57/ui/Button";
import {
  CloseIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/block57/ui/icons";
import Logo from "./Logo";
import useScrollLock from "./useScrollLock";
import styles from "./MobileMenu.module.scss";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-height navigation drawer for < 1024px. Modal dialog semantics: focus
 * moves in on open, Tab is trapped, Escape / backdrop / close button close
 * it, focus returns to the menu button, and page scroll is locked.
 */
export default function MobileMenu({
  id,
  open,
  onClose,
  pathname,
  returnFocusRef,
}) {
  const auth = useAuthSafe();
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

  const user = auth?.user ?? null;

  async function handleSignOut() {
    onClose();
    await auth?.logout();
    notifySuccess("You have been signed out.");
  }

  return (
    <div
      className={styles.root}
      data-open={open ? "true" : "false"}
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
        <div className={styles.top}>
          <Logo variant="dark" onClick={onClose} />
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <nav aria-label="Main" className={styles.nav}>
          <ul>
            {SITE_NAV.map((item) => {
              const active = isPathActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ButtonLink
          href={INQUIRE_LINK.href}
          block
          arrow
          className={styles.cta}
          onClick={onClose}
        >
          {INQUIRE_LINK.label}
        </ButtonLink>

        <div className={styles.group}>
          <p className={styles.groupTitle}>Account</p>
          {user ? (
            <ul className={styles.list}>
              <li>
                <a href={ACCOUNT_LINKS.account.href}>
                  {ACCOUNT_LINKS.account.label}
                </a>
              </li>
              <li>
                <a href={ACCOUNT_LINKS.favourites.href}>
                  {ACCOUNT_LINKS.favourites.label}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </li>
            </ul>
          ) : (
            <ul className={styles.list}>
              <li>
                <a href={ACCOUNT_LINKS.signIn.href}>
                  {ACCOUNT_LINKS.signIn.label}
                </a>
              </li>
            </ul>
          )}
        </div>

        <div className={styles.group}>
          <p className={styles.groupTitle}>Contact</p>
          <ul className={styles.contact}>
            <li>
              <a href={CONTACT.phoneHref}>
                <PhoneIcon size={16} />
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={CONTACT.emailHref}>
                <MailIcon size={16} />
                {CONTACT.email}
              </a>
            </li>
            <li>
              <PinIcon size={16} />
              <span>{ADDRESS.full}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
