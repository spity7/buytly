"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import { findUnitById, getUnitAnchorId } from "@/lib/block57/units";
import {
  getUnitTypeByCatalogValue,
  getUnitTypeHref,
} from "@/content/block57/unitTypes";
import { AVAILABILITY_COPY } from "@/content/block57/apartments";
import { TimesIcon } from "@/components/block57/ui/icons";
import styles from "./UnitLinkResolver.module.scss";

/**
 * `/apartments/?unit=<id>` (target of the legacy /single-v1/:id/ redirect,
 * Buytly partner links and dashboard "view" links): once the project has
 * loaded, sends the visitor to `/apartments/<slug>/#unit-<id>` (the unit's
 * `type` is a catalog value, mapped to the page slug). If the unit is not
 * public any more, the index stays with a dismissible notice above the grid.
 * Renders nothing without `?unit=`.
 *
 * Uses useSearchParams, so render it inside <Suspense> (keeps the page static).
 */
export default function UnitLinkResolver({ className }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitId = String(searchParams?.get("unit") ?? "").trim();
  const { project, units, isError } = useBlock57Project();
  const [dismissedFor, setDismissedFor] = useState(null);
  const redirectedFor = useRef(null);

  const loaded = Boolean(project);
  const unit = unitId && loaded ? findUnitById(units, unitId) : null;
  const typeSlug = unit ? getUnitTypeByCatalogValue(unit.type)?.slug : null;
  const target = typeSlug
    ? `${getUnitTypeHref(typeSlug)}#${getUnitAnchorId(unit)}`
    : null;

  useEffect(() => {
    if (!target || redirectedFor.current === unitId) return;
    redirectedFor.current = unitId;
    router.replace(target);
  }, [router, target, unitId]);

  if (!unitId || dismissedFor === unitId) return null;

  const classes = [styles.notice, className].filter(Boolean).join(" ");

  // Waiting for the project, or about to leave for the type page.
  if ((!loaded && !isError) || target) {
    return (
      <p className={classes} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        {AVAILABILITY_COPY.resolving}
      </p>
    );
  }

  const message =
    !loaded && isError
      ? AVAILABILITY_COPY.error
      : AVAILABILITY_COPY.unitNotListed;

  return (
    <div className={classes} role="status">
      <p className={styles.message}>{message}</p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setDismissedFor(unitId)}
        aria-label={AVAILABILITY_COPY.dismiss}
      >
        <TimesIcon size={14} />
      </button>
    </div>
  );
}
