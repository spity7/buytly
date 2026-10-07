"use client";

import VisuallyHidden from "./VisuallyHidden";
import { AVAILABILITY_COPY } from "@/content/block57/apartments";
import { formatAvailabilityCount } from "@/lib/block57/format";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import styles from "./LiveAvailability.module.scss";

/**
 * Live availability of one residence type (optionally one building), from
 * the page's single project request (public units only: active + sold).
 *   loading → skeleton (same line height, no layout shift)
 *   some available → "3 of 4 available" · all sold → "Sold out"
 *   nothing listed / API unavailable → "Availability on request"
 *
 * @param {{ type: string, building?: string, showDot?: boolean,
 *   size?: "sm"|"base", className?: string }} props
 */
export default function LiveAvailability({
  type,
  building,
  showDot = true,
  size = "sm",
  className,
}) {
  const { availability, isLoading, isError } = useTypeUnits(type, {
    building,
  });
  const classes = [styles.line, styles[`size-${size}`], className]
    .filter(Boolean)
    .join(" ");

  if (isLoading) {
    return (
      <span className={classes} data-state="loading">
        <span className={styles.skeleton} aria-hidden="true" />
        <VisuallyHidden>{AVAILABILITY_COPY.loading}</VisuallyHidden>
      </span>
    );
  }

  const label = isError
    ? AVAILABILITY_COPY.countOnRequest
    : formatAvailabilityCount(availability, {
        empty: AVAILABILITY_COPY.countOnRequest,
        soldOut: AVAILABILITY_COPY.soldOut,
      });
  const state =
    !isError && availability.available > 0 ? "available" : "unavailable";

  return (
    <span className={classes} data-state={state}>
      {showDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
