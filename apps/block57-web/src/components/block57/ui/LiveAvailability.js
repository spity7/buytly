"use client";

import VisuallyHidden from "./VisuallyHidden";
import { AVAILABILITY_COPY } from "@/content/block57/apartments";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import styles from "./LiveAvailability.module.scss";

/**
 * Live availability of one residence type (optionally one building), from
 * the page's single project request (public units only: active + sold), in
 * the meta-pill typography (URW 10/16, 2px, uppercase):
 *   loading → a bar of the same line height (no layout shift)
 *   some available → "3 of 8 available" (counts #346054, words #ADA4A1)
 *   all sold → "Sold out" (#000)
 *   nothing listed / API unavailable → "Availability on request" (#ADA4A1)
 * Inline-block: the parent places it (cards centre it 10px under the pill).
 *
 * @param {{ type: string, building?: string, className?: string }} props
 *   `type`: catalog value ("one-bedroom") or page slug ("1-bedroom").
 */
export default function LiveAvailability({ type, building, className }) {
  const { availability, isLoading, isError } = useTypeUnits(type, {
    building,
  });
  const classes = [styles.line, className].filter(Boolean).join(" ");

  if (isLoading) {
    return (
      <span className={classes} data-state="loading">
        <span className={styles.skeleton} aria-hidden="true" />
        <VisuallyHidden>{AVAILABILITY_COPY.loading}</VisuallyHidden>
      </span>
    );
  }

  const { available, total } = availability;

  if (isError || !total) {
    return (
      <span className={classes} data-state="on-request">
        {AVAILABILITY_COPY.countOnRequest}
      </span>
    );
  }

  if (!available) {
    return (
      <span className={classes} data-state="sold-out">
        {AVAILABILITY_COPY.soldOut}
      </span>
    );
  }

  return (
    <span className={classes} data-state="available">
      <span className={styles.count}>{available}</span> of{" "}
      <span className={styles.count}>{total}</span> available
    </span>
  );
}
