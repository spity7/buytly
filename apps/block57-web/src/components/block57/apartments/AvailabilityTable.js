"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/block57/ui/Container";
import FavoriteToggle from "@/components/block57/ui/FavoriteToggle";
import LiveAvailability from "@/components/block57/ui/LiveAvailability";
import MetaPill from "@/components/block57/ui/MetaPill";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { Button, ButtonLink } from "@/components/block57/ui/Button";
import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import {
  findUnitById,
  formatArea,
  formatBedroomCount,
  formatBuildingLetter,
  formatCount,
  formatFloor,
  getUnitAnchorId,
  getUnitFloorPlans,
  getUnitId,
  getUnitStatusLabel,
} from "@/lib/block57/units";
import {
  PRICE_ON_REQUEST_LABEL,
  SHOW_PRICES,
  formatUnitPrice,
} from "@/lib/block57/prices";
import {
  getUnitTypeByCatalogValue,
  getUnitTypeHref,
  getUnitTypeInquireHref,
} from "@/content/block57/unitTypes";
import {
  AVAILABILITY_COPY,
  AVAILABILITY_TABLE_COPY as TABLE,
  TYPE_PAGE_COPY,
} from "@/content/block57/apartments";
import styles from "./AvailabilityTable.module.scss";

const HIGHLIGHT_MS = 2600;
const SKELETON_ROWS = 3;
const UNIT_HASH = /^#unit-([A-Za-z0-9_-]{1,64})$/;

/** Data columns (stacked cards use `col` as the grid area). Price only when allowed. */
const COLUMNS = [
  "block",
  "level",
  "beds",
  "baths",
  "area",
  "status",
  ...(SHOW_PRICES ? ["price"] : []),
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

function Cell({ col, children }) {
  return (
    <td role="cell" data-col={col} className={styles.cell}>
      <span className={styles.cellLabel} aria-hidden="true">
        {TABLE.columns[col]}
      </span>
      <span className={styles.cellValue}>{children}</span>
    </td>
  );
}

function FloorPlanLinks({ unit, title }) {
  const plans = getUnitFloorPlans(unit);
  return plans.map((plan, index) => (
    <ButtonLink
      key={plan._id || plan.url}
      href={plan.url}
      variant="textLink"
      external
      className={styles.planLink}
    >
      {plans.length === 1
        ? TABLE.floorPlan
        : TABLE.floorPlanNumbered(index + 1)}
      <VisuallyHidden>{` for residence ${title}`}</VisuallyHidden>
    </ButtonLink>
  ));
}

function UnitRow({ unit, typeSlug, highlighted }) {
  const id = String(getUnitId(unit));
  const title = unit.title || "Residence";

  return (
    <tr
      role="row"
      id={getUnitAnchorId(id)}
      tabIndex={-1}
      className={styles.row}
      data-status={unit.status}
      data-highlighted={highlighted ? "true" : undefined}
    >
      <th role="rowheader" scope="row" data-col="title" className={styles.cell}>
        <span className={styles.unitTitle}>{title}</span>
      </th>
      <Cell col="block">{formatBuildingLetter(unit.building)}</Cell>
      <Cell col="level">{formatFloor(unit.floor)}</Cell>
      <Cell col="beds">{formatBedroomCount(unit.bedrooms)}</Cell>
      <Cell col="baths">{formatCount(unit.bathrooms)}</Cell>
      <Cell col="area">{formatArea(unit.area, unit.areaUnit)}</Cell>
      <td role="cell" data-col="status" className={styles.cell}>
        <MetaPill className={styles.status} data-status={unit.status}>
          {getUnitStatusLabel(unit.status)}
        </MetaPill>
      </td>
      {SHOW_PRICES ? (
        <Cell col="price">
          {formatUnitPrice(unit) ?? PRICE_ON_REQUEST_LABEL}
        </Cell>
      ) : null}
      <td role="cell" data-col="actions" className={styles.cell}>
        <div className={styles.actions}>
          <FloorPlanLinks unit={unit} title={title} />
          <FavoriteToggle unitId={id} unitLabel={title} status={unit.status} />
          <ButtonLink
            href={getUnitTypeInquireHref(typeSlug, id)}
            size="sm"
            className={styles.inquire}
          >
            {TABLE.inquire}
            <VisuallyHidden>{` about residence ${title}`}</VisuallyHidden>
          </ButtonLink>
        </div>
      </td>
    </tr>
  );
}

function SkeletonRow({ index }) {
  return (
    <tr role="row" className={styles.row} aria-hidden="true">
      <th role="rowheader" scope="row" data-col="title" className={styles.cell}>
        <span className={styles.bar} style={{ width: 64 }} />
      </th>
      {COLUMNS.map((col) => (
        <Cell key={col} col={col}>
          <span
            className={styles.bar}
            style={{ width: 40 + ((index + col.length) % 3) * 12 }}
          />
        </Cell>
      ))}
      <td role="cell" data-col="actions" className={styles.cell}>
        <div className={styles.actions}>
          <span className={[styles.bar, styles.barRound].join(" ")} />
          <span className={[styles.bar, styles.barButton].join(" ")} />
        </div>
      </td>
    </tr>
  );
}

/**
 * LIVE availability table of one residence type, after "Apartment photos"
 * (client-side: statuses change and unit media URLs are signed for 1 hour).
 * Only active ("Available") and sold units are listed: draft/pending/archived
 * units that managers receive in the embed never reach it. Prices stay hidden
 * unless NEXT_PUBLIC_SHOW_PRICES=true and the unit has a numeric price.
 * Row actions: the unit's API floor plans (new tab), favourite heart and
 * INQUIRE → /inquire/?type=<slug>&unit=<id>. Stacked cards ≤1200px.
 *
 * Each row has id="unit-<_id>"; a matching URL hash scrolls to the row and
 * flashes it (target of /apartments/?unit=<id> deep links). A unit of another
 * type sends the visitor to that type's page.
 *
 * @param {{ type: object }} props an entry of UNIT_TYPES
 */
export default function AvailabilityTable({ type }) {
  const router = useRouter();
  const { units, isLoading, isError, refetch } = useTypeUnits(
    type.catalogValue,
  );
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
      const otherType = elsewhere
        ? getUnitTypeByCatalogValue(elsewhere.type)
        : null;
      if (otherType && otherType.slug !== type.slug) {
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
  }, [hashId, isLoading, isError, units, allUnits, type.slug, router]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timer = window.setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const hashMissing =
    Boolean(hashId) &&
    !isLoading &&
    !isError &&
    !findUnitById(units, hashId) &&
    !findUnitById(allUnits, hashId);
  const isEmpty = !isLoading && !isError && units.length === 0;
  const inquireHref = getUnitTypeInquireHref(type.slug);
  const titleId = "availability-title";

  async function handleRetry() {
    setRetrying(true);
    try {
      await refetch();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <Section
      id="availability"
      spacing="none"
      className={styles.section}
      aria-labelledby={titleId}
    >
      <Container>
        <SectionHeading
          eyebrow={TYPE_PAGE_COPY.availability.eyebrow}
          title={TYPE_PAGE_COPY.availability.title}
          as="h2"
          size="subsection"
          id={titleId}
          className={styles.heading}
        />
        <p className={styles.summary} aria-live="polite">
          <LiveAvailability type={type.catalogValue} />
        </p>

        {hashMissing ? (
          <p className={styles.notice} role="status">
            {AVAILABILITY_COPY.unitNotListed}
          </p>
        ) : null}

        {isError ? (
          <div className={styles.state} role="status">
            <p className={styles.stateText}>{AVAILABILITY_COPY.error}</p>
            <div className={styles.stateActions}>
              <ButtonLink href={inquireHref} size="sm">
                {TABLE.inquire}
              </ButtonLink>
              <Button
                variant="textLink"
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
            <p className={styles.stateText}>{AVAILABILITY_COPY.empty}</p>
            <div className={styles.stateActions}>
              <ButtonLink href={inquireHref} size="sm">
                {TABLE.inquire}
              </ButtonLink>
            </div>
          </div>
        ) : null}

        {!isError && !isEmpty ? (
          <table
            role="table"
            className={styles.table}
            aria-busy={isLoading ? "true" : undefined}
          >
            <caption className={styles.caption}>
              {TABLE.caption(type.pluralLabel)}
            </caption>
            <thead role="rowgroup" className={styles.thead}>
              <tr role="row">
                {["title", ...COLUMNS].map((col) => (
                  <th
                    key={col}
                    role="columnheader"
                    scope="col"
                    data-col={col}
                    className={styles.th}
                  >
                    {TABLE.columns[col]}
                  </th>
                ))}
                <th
                  role="columnheader"
                  scope="col"
                  data-col="actions"
                  className={styles.th}
                >
                  <VisuallyHidden>{TABLE.columns.actions}</VisuallyHidden>
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
        ) : null}
      </Container>
    </Section>
  );
}
