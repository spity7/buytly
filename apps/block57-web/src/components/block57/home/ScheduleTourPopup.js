"use client";

import { useEffect, useRef, useState } from "react";
import useScrollLock from "@/components/block57/layout/useScrollLock";
import { Button } from "@/components/block57/ui/Button";
import { TimesIcon } from "@/components/block57/ui/icons";
import { SCHEDULE_TOUR } from "@/content/block57/home";
import ScheduleTourForm from "./ScheduleTourForm";
import styles from "./ScheduleTourPopup.module.scss";

const TITLE_ID = "schedule-tour-title";
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab cycling inside the dialog (not out to the browser UI). */
function trapTab(event) {
  if (event.key !== "Tab") return;
  const nodes = [...event.currentTarget.querySelectorAll(FOCUSABLE)].filter(
    (node) => node.getClientRects().length > 0,
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
  }
}

/**
 * SCHEDULE A TOUR button and its popup (live Magnific "zoom-in" popup): a
 * white 600px panel (750px tall; never wider or taller than the screen) on
 * an 80% #0B0B0B backdrop, the #F6F1EA × block top right and the tour form.
 *
 * A native modal <dialog>: focus moves in and Tab cycles inside it (the page
 * behind is inert), Escape, the × and a click on the backdrop close it, focus returns
 * to the button and page scroll is locked. `data-b57-modal` hides the
 * floating buttons meanwhile. The form mounts on first open and keeps what
 * was typed if the popup is closed and reopened.
 *
 * @param {{ label: string, className?: string }} props  button label / class
 */
export default function ScheduleTourPopup({ label, className }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const pressedOnBackdrop = useRef(false);

  useScrollLock(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, mounted]);

  const show = () => {
    setMounted(true);
    setOpen(true);
  };

  // Fired by dialog.close(), the × and Escape (native cancel → close).
  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="whiteBordered"
        className={className}
        aria-haspopup="dialog"
        onClick={show}
      >
        {label}
      </Button>

      {mounted ? (
        <dialog
          ref={dialogRef}
          className={styles.dialog}
          aria-labelledby={TITLE_ID}
          data-b57-modal={open ? "open" : undefined}
          onClose={handleClose}
          onKeyDown={trapTab}
          onPointerDown={(event) => {
            pressedOnBackdrop.current = event.target === event.currentTarget;
          }}
          onClick={(event) => {
            if (
              pressedOnBackdrop.current &&
              event.target === event.currentTarget
            ) {
              dialogRef.current?.close();
            }
            pressedOnBackdrop.current = false;
          }}
        >
          <button
            type="button"
            className={styles.close}
            onClick={() => dialogRef.current?.close()}
            aria-label={SCHEDULE_TOUR.closeLabel}
          >
            <TimesIcon size={20} />
          </button>
          <div className={styles.body}>
            <h2 id={TITLE_ID} className={styles.title}>
              {SCHEDULE_TOUR.title}
            </h2>
            <ScheduleTourForm titleId={TITLE_ID} />
          </div>
        </dialog>
      ) : null}
    </>
  );
}
