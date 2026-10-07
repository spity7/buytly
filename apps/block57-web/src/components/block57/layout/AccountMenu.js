"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAuthSafe } from "@/providers/AuthProvider";
import { notifySuccess } from "@/lib/toast";
import { ACCOUNT_LINKS } from "@/content/block57/site";
import {
  ChevronIcon,
  LogoutIcon,
  UserIcon,
} from "@/components/block57/ui/icons";
import styles from "./AccountMenu.module.scss";

/**
 * Desktop account entry. Signed out: "Sign in" (→ /login/). Signed in: a
 * disclosure with My account, Favourites and Sign out. Account pages live in
 * the `(app)` root layout, so plain <a> links (full page load, no prefetch).
 */
export default function AccountMenu({ className }) {
  const auth = useAuthSafe();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    // Keyboard focus leaving the menu closes it. (focusin, not blur: Safari
    // does not focus links on click, so a blur would close the menu mid-click.)
    function onFocusIn(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  const user = auth?.user ?? null;
  const loading = !auth || auth.isLoading;
  const classes = [styles.wrapper, className].filter(Boolean).join(" ");

  if (loading || !user) {
    return (
      <div className={classes} data-loading={loading ? "true" : undefined}>
        <a
          href={ACCOUNT_LINKS.signIn.href}
          className={styles.link}
          {...(loading ? { "aria-hidden": "true", tabIndex: -1 } : {})}
        >
          <UserIcon size={18} />
          <span>{ACCOUNT_LINKS.signIn.label}</span>
        </a>
      </div>
    );
  }

  async function handleSignOut() {
    setOpen(false);
    await auth.logout();
    notifySuccess("You have been signed out.");
  }

  const firstName = String(user.firstName || "").trim();

  return (
    <div ref={wrapperRef} className={classes}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.link}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserIcon size={18} />
        <span className={styles.name}>{firstName || "Account"}</span>
        <ChevronIcon size={14} className={styles.chevron} />
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <p className={styles.signedInAs}>
          Signed in{user.email ? ` as ${user.email}` : ""}
        </p>
        <ul className={styles.list}>
          <li>
            <a href={ACCOUNT_LINKS.account.href} className={styles.item}>
              {ACCOUNT_LINKS.account.label}
            </a>
          </li>
          <li>
            <a href={ACCOUNT_LINKS.favourites.href} className={styles.item}>
              {ACCOUNT_LINKS.favourites.label}
            </a>
          </li>
          <li className={styles.separator}>
            <button
              type="button"
              className={styles.item}
              onClick={handleSignOut}
            >
              <LogoutIcon size={16} />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
