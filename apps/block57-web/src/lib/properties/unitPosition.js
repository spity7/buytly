/**
 * Optional unit position (block / building and floor). Limits mirror the
 * server's `property.validation.js`: building ≤ 50 chars, floor -5…300.
 */
export const UNIT_BUILDING_MAX_LENGTH = 50;
export const UNIT_FLOOR_MIN = -5;
export const UNIT_FLOOR_MAX = 300;

const INTEGER_PATTERN = /^-?\d+$/;

/** "" → undefined (not set), "3" → 3, anything that is not a whole number in range → null. */
export function parseOptionalUnitFloor(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return undefined;
  if (!INTEGER_PATTERN.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n < UNIT_FLOOR_MIN || n > UNIT_FLOOR_MAX) {
    return null;
  }
  return n;
}

/** Compact floor label: 0 → "Ground", 4 → "L4", -1 → "L-1"; missing → "". */
export function formatUnitFloorShort(floor) {
  if (floor == null || floor === "") return "";
  const n = Number(floor);
  if (!Number.isFinite(n)) return "";
  return n === 0 ? "Ground" : `L${n}`;
}

/**
 * Compact position for dashboard tables: "A · L4", "A · Ground", "A" or "L4".
 * Returns "" when the unit has neither a building nor a floor.
 */
export function formatUnitPosition(unit) {
  const building = String(unit?.building ?? "").trim();
  return [building, formatUnitFloorShort(unit?.floor)]
    .filter(Boolean)
    .join(" · ");
}
