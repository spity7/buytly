import { partitionProjectUnits } from "@/lib/properties/mapProperty";

/**
 * Unit helpers for the public Block 57 site. Units come from the project embed
 * (`GET /projects/slug/:slug` → `data.units`). Logged-in managers also receive
 * draft/pending/archived units, so public UI must always go through
 * {@link getPublicUnits}.
 */

const UNIT_STATUS_LABELS = {
  active: "Available",
  sold: "Sold",
};

/** "Available" / "Sold" (public statuses only; anything else → ""). */
export function getUnitStatusLabel(status) {
  return UNIT_STATUS_LABELS[status] ?? "";
}

export function getUnitId(unit) {
  return unit?._id ?? unit?.id ?? null;
}

/** Only active ("Available") and sold units. Accepts a project or a unit array. */
export function getPublicUnits(projectOrUnits) {
  const units = Array.isArray(projectOrUnits)
    ? projectOrUnits
    : projectOrUnits?.units;
  if (!Array.isArray(units)) return [];
  const { available, sold } = partitionProjectUnits(
    units.filter((unit) => unit && !unit.deletedAt),
  );
  return [...available, ...sold];
}

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function compareNullableNumbers(a, b) {
  const aMissing = a == null || Number.isNaN(Number(a));
  const bMissing = b == null || Number.isNaN(Number(b));
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return Number(a) - Number(b);
}

/** Building (A→C, missing last), then floor (low→high, missing last), then title (natural). */
function compareUnits(a, b) {
  const buildingA = String(a?.building ?? "").trim();
  const buildingB = String(b?.building ?? "").trim();
  if (buildingA !== buildingB) {
    if (!buildingA) return 1;
    if (!buildingB) return -1;
    return collator.compare(buildingA, buildingB);
  }
  const byFloor = compareNullableNumbers(a?.floor, b?.floor);
  if (byFloor !== 0) return byFloor;
  return collator.compare(String(a?.title ?? ""), String(b?.title ?? ""));
}

/** New sorted array (does not mutate). */
export function sortUnits(units = []) {
  return [...(units || [])].sort(compareUnits);
}

/** `{ [catalogValue]: units[] }` keyed by `unit.type`, input order kept inside each type. */
export function groupUnitsByType(units = []) {
  const groups = {};
  for (const unit of units || []) {
    const type = String(unit?.type ?? "").toLowerCase() || "other";
    (groups[type] ||= []).push(unit);
  }
  return groups;
}

/** Counts over public units (pass the output of getPublicUnits). */
export function summarizeAvailability(units = []) {
  let available = 0;
  let sold = 0;
  for (const unit of units || []) {
    if (unit?.status === "active") available += 1;
    else if (unit?.status === "sold") sold += 1;
  }
  return { total: available + sold, available, sold };
}

/** 0 → "Ground", 3 → "Level 3", -1 → "Basement 1", missing → "—". */
export function formatFloor(floor) {
  if (floor == null || floor === "" || Number.isNaN(Number(floor))) return "—";
  const n = Number(floor);
  if (n === 0) return "Ground";
  if (n < 0) return `Basement ${Math.abs(n)}`;
  return `Level ${n}`;
}

/** 205 → "205 sqm" (unit from `areaUnit`), missing → "—". */
export function formatArea(area, areaUnit = "sqm") {
  if (area == null || area === "" || Number.isNaN(Number(area))) return "—";
  const value = Number(area).toLocaleString("en-GB", {
    maximumFractionDigits: 1,
  });
  return `${value} ${areaUnit || "sqm"}`;
}

/** Plain count (bathrooms): 2 → "2", missing → "—". */
export function formatCount(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : String(n);
}

/** Bedrooms: 0 → "Studio", 2 → "2", missing → "—". */
export function formatBedroomCount(bedrooms) {
  const count = formatCount(bedrooms);
  return count === "0" ? "Studio" : count;
}

/** Building letter: "a" → "A", missing → "—". */
export function formatBuildingLetter(building) {
  const value = String(building ?? "").trim();
  return value ? value.toUpperCase() : "—";
}

export function findUnitById(units = [], id) {
  if (!id) return null;
  const target = String(id);
  return (
    (units || []).find((unit) => String(getUnitId(unit)) === target) ?? null
  );
}

/** DOM id used for deep links: /apartments/<slug>/#unit-<id>. */
export function getUnitAnchorId(unitOrId) {
  const id = typeof unitOrId === "object" ? getUnitId(unitOrId) : unitOrId;
  return `unit-${id}`;
}

/** Floor plans that have a signed URL (signed for 1 hour: never cache them at build time). */
export function getUnitFloorPlans(unit) {
  return (unit?.floorPlans || []).filter((plan) => plan?.url);
}
