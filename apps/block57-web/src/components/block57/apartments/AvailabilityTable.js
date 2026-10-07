"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/block57/ui/Container";
import FavoriteToggle from "@/components/block57/ui/FavoriteToggle";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import StatusPill from "@/components/block57/ui/StatusPill";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { Button, ButtonLink } from "@/components/block57/ui/Button";
import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import {
  findUnitById,
  formatArea,
  formatFloor,
  getUnitAnchorId,
  getUnitId,
} from "@/lib/block57/units";
import {
  PRICE_ON_REQUEST_LABEL,
  SHOW_PRICES,
  formatUnitPrice,
} from "@/lib/block57/prices";
import {
  getUnitType,
  getUnitTypeHref,
  getUnitTypeInquireHref,
} from "@/content/block57/unitTypes";
import {
  AVAILABILITY_COPY,
  TYPE_PAGE_SECTIONS,
} from "@/content/block57/apartments";
import {
  formatBedroomsShort,
  formatBuildingShort,
  formatCountShort,
} from "./format";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import styles from "./AvailabilityTable.module.scss";

const COPY = TYPE_PAGE_SECTIONS.availability;
const HIGHLIGHT_MS = 2600;
const SKELETON_ROWS = 3;
const UNIT_HASH = /^#unit-([A-Za-z0-9_-]{1,64})$/;

/** Columns (mobile cards use `col` as the grid area). Price only when allowed. */
const COLUMNS = [
  { col: "title", label: "Residence" },
  { col: "block", label: "Block" },
  { col: "level", label: "Level" },
  { col: "beds", label: "Bedrooms" },
  { col: "baths", label: "Bathrooms" },
  { col: "area", label: "Area" },
  { col: "status", label: "Status" },
  ...(SHOW_PRICES ? [{ col: "price", label: "Price" }] : []),
];

function readUnitHash() {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(UNIT_HASH);
  return match ? match[1] : null;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Cell({ col, label, children, className }) {
  return (
    <td
      role="cell"
      data-col={col}
      className={[styles.cell, className].filter(Boolean).join(" ")}
    >
      <span className={styles.cellLabel} aria-hidden="true">
        {label}
      </span>
      <span className={styles.cellValue}>{children}</span>
    </td>
  );
}

function UnitRow({ unit, typeSlug, highlighted }) {
  const id = String(getUnitId(unit));
  const title = unit.title || "Residence";
  const price = formatUnitPrice(unit);

  return (
    <tr
      role="row"
      id={getUnitAnchorId(id)}
      tabIndex={-1}
      className={styles.row}
      data-status={unit.status}
      data-highlighted={highlighted ? "true" : undefined}
    >
      <th
        role="rowheader"
        scope="row"
        data-col="title"
        className={[styles.cell, styles.titleCell].join(" ")}
      >
        {title}
      </th>
      <Cell col="block" label="Block">
        {formatBuildingShort(unit.building)}
      </Cell>
      <Cell col="level" label="Level">
        {formatFloor(unit.floor)}
      </Cell>
      <Cell col="beds" label="Bedrooms">
        {formatBedroomsShort(unit.bedrooms)}
      </Cell>
      <Cell col="baths" label="Bathrooms">
        {formatCountShort(unit.bathrooms)}
      </Cell>
      <Cell col="area" label="Area">
        {formatArea(unit.area, unit.areaUnit)}
      </Cell>
      <td
        role="cell"
        data-col="status"
        className={[styles.cell, styles.statusCell].join(" ")}
      >
        <StatusPill status={unit.status} />
      </td>
      {SHOW_PRICES ? (
        <Cell col="price" label="Price">
          {price ?? PRICE_ON_REQUEST_LABEL}
        </Cell>
      ) : null}
      <td
        role="cell"
        data-col="actions"
        className={[styles.cell, styles.actionsCell].join(" ")}
      >
        <div className={styles.actions}>
          <FavoriteToggle
            unitId={id}
            unitLabel={title}
            status={unit.status}
            size="sm"
          />
          <ButtonLink
            href={getUnitTypeInquireHref(typeSlug, id)}
            variant="secondary"
            size="sm"
            className={styles.inquire}
          >
            Inquire
            <VisuallyHidden>{` about residence ${title}`}</VisuallyHidden>
          </ButtonLink>
        </div>
      </td>
    </tr>
  );
}

function SkeletonRow({ index }) {
  return (
    <tr
      role="row"
      className={[styles.row, styles.skeletonRow].join(" ")}
      aria-hidden="true"
    >
      {COLUMNS.map(({ col, label }) =>
        col === "title" ? (
          <th
            key={col}
            role="rowheader"
            scope="row"
            data-col={col}
            className={[styles.cell, styles.titleCell].join(" ")}
          >
            <span className={styles.bar} style={{ width: "4.5rem" }} />
          </th>
        ) : (
          <Cell key={col} col={col} label={label}>
            <span
              className={styles.bar}
              style={{ width: `${3 + ((index + col.length) % 3)}rem` }}
            />
          </Cell>
        ),
      )}
      <td
        role="cell"
        data-col="actions"
        className={[styles.cell, styles.actionsCell].join(" ")}
      >
        <div className={styles.actions}>
          <span className={[styles.bar, styles.barRound].join(" ")} />
          <span className={[styles.bar, styles.barButton].join(" ")} />
        </div>
      </td>
    </tr>
  );
}

/**
 * LIVE availability for one residence type (client-side: unit media URLs are
 * signed for 1 hour and statuses change). Only active ("Available") and sold
 * units are listed — draft/pending/archived units that managers receive in the
 * embed never reach this table. Prices stay hidden unless
 * NEXT_PUBLIC_SHOW_PRICES=true and the unit has a numeric price.
 *
 * Each row has id="unit-<_id>"; a matching URL hash scrolls to the row and
 * briefly highlights it (target of /apartments/?unit=<id> deep links).
 */
export default function AvailabilityTable({ typeSlug }) {
  const router = useRouter();
  const type = getUnitType(typeSlug);
  const { units, availability, isLoading, isError, refetch } =
    useTypeUnits(typeSlug);
  const { units: allUnits } = useBlock57Project();

  const [hashId, setHashId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const handledHash = useRef(null);

  // Track #unit-<id> in the URL (initial load, client navigation, hashchange).
  useEffect(() => {
    const read = () => setHashId(readUnitHash());
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  // Once the units are in, scroll to the targeted row and highlight it.
  useEffect(() => {
    if (!hashId || isLoading || isError) return undefined;
    if (handledHash.current === hashId) return undefined;

    const unit = findUnitById(units, hashId);
    if (!unit) {
      handledHash.current = hashId;
      // A public unit of another type (e.g. an old link): go to its page.
      const elsewhere = findUnitById(allUnits, hashId);
      const otherType = elsewhere ? getUnitType(elsewhere.type) : null;
      if (otherType && otherType.slug !== typeSlug) {
        router.replace(
          `${getUnitTypeHref(otherType.slug)}#${getUnitAnchorId(hashId)}`,
        );
      }
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const row = document.getElementById(getUnitAnchorId(hashId));
      if (!row) return;
      handledHash.current = hashId;
      row.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      row.focus({ preventScroll: true });
      setHighlightId(hashId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hashId, isLoading, isError, units, allUnits, typeSlug, router]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = window.setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  if (!type) return null;

  const hashMissing =
    Boolean(hashId) &&
    !isLoading &&
    !isError &&
    !findUnitById(units, hashId) &&
    !findUnitById(allUnits, hashId);
  const isEmpty = !isLoading && !isError && units.length === 0;
  const inquireHref = getUnitTypeInquireHref(type.slug);

  async function handleRetry() {
    setRetrying(true);
    try {
      await refetch();
    } finally {
      setRetrying(false);
    }
  }

  let summary = null;
  if (isLoading) {
    summary = <span className={styles.summaryBar} aria-hidden="true" />;
  } else if (!isError && availability.total > 0) {
    summary = `${availability.available} of ${availability.total} ${
      availability.total === 1 ? "residence" : "residences"
    } currently available.`;
  }

  return (
    <Section id="availability" tone="alt" aria-labelledby="availability-title">
      <Container>
        <div className={styles.head}>
          <SectionHeading
            eyebrow={COPY.eyebrow}
            title={COPY.title}
            id="availability-title"
            className={styles.heading}
          />
          <p className={styles.summary} aria-live="polite">
            {summary}
          </p>
        </div>

        {hashMissing ? (
          <p className={styles.notice} role="status">
            {AVAILABILITY_COPY.unitNotListed}
          </p>
        ) : null}

        {isError ? (
          <div className={styles.state} role="status">
            <p>{AVAILABILITY_COPY.error}</p>
            <div className={styles.stateActions}>
              <ButtonLink href={inquireHref} size="sm">
                Inquire
              </ButtonLink>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRetry}
                disabled={retrying}
              >
                {AVAILABILITY_COPY.retry}
              </Button>
            </div>
          </div>
        ) : null}

        {isEmpty ? (
          <div className={styles.state}>
            <p>{AVAILABILITY_COPY.empty}</p>
            <div className={styles.stateActions}>
              <ButtonLink href={inquireHref} size="sm">
                Inquire
              </ButtonLink>
            </div>
          </div>
        ) : null}

        {!isError && !isEmpty ? (
          <div className={styles.wrap}>
            {isLoading ? (
              <VisuallyHidden as="p" role="status">
                Loading live availability
              </VisuallyHidden>
            ) : null}
            <table
              role="table"
              className={styles.table}
              aria-busy={isLoading ? "true" : undefined}
            >
              <caption className={styles.caption}>
                {`${type.pluralLabel} at Block 57 — live availability`}
              </caption>
              <thead role="rowgroup" className={styles.thead}>
                <tr role="row">
                  {COLUMNS.map(({ col, label }) => (
                    <th
                      key={col}
                      role="columnheader"
                      scope="col"
                      data-col={col}
                      className={styles.th}
                    >
                      {label}
                    </th>
                  ))}
                  <th
                    role="columnheader"
                    scope="col"
                    data-col="actions"
                    className={[styles.th, styles.thActions].join(" ")}
                  >
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup" className={styles.tbody}>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                      <SkeletonRow key={index} index={index} />
                    ))
                  : units.map((unit) => (
                      <UnitRow
                        key={getUnitId(unit)}
                        unit={unit}
                        typeSlug={type.slug}
                        highlighted={
                          highlightId !== null &&
                          String(getUnitId(unit)) === highlightId
                        }
                      />
                    ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
