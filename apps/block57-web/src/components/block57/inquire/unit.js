import { getUnitTypeLabel } from "@/content/block57/unitTypes";
import { INQUIRE_FORM } from "@/content/block57/inquire";
import { CONTACT_LIMITS } from "@/components/block57/forms/validation";

/**
 * Helpers for an inquiry about one residence (`/inquire/?unit=<id>`). The unit
 * comes from the public project embed (useBlock57Project); `unit.type` is the
 * API catalog value ("one-bedroom"), resolved by getUnitTypeLabel.
 */

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

const trimmed = (value) => String(value ?? "").trim();

function formatBlock(building) {
  const value = trimmed(building);
  return value ? `Block ${value}` : "";
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** "B-204 · Block B" for the chip. */
export function describeUnitShort(unit) {
  return [trimmed(unit?.title) || "—", formatBlock(unit?.building)]
    .filter(Boolean)
    .join(" · ");
}

/** "B-204 · Urban Villa · Block B" (sent as `unitLabel`, ≤ 80 characters). */
export function buildUnitLabel(unit) {
  const parts = [
    trimmed(unit?.title),
    getUnitTypeLabel(unit?.type),
    formatBlock(unit?.building),
  ].filter(Boolean);
  return truncate(parts.join(" · "), CONTACT_LIMITS.unitLabel);
}

/** Polite default message: "… residence B-204 (Urban Villa, Block B). …" */
export function buildUnitMessage(unit) {
  const title = trimmed(unit?.title);
  if (!title) return "";
  const details = [getUnitTypeLabel(unit.type), formatBlock(unit.building)]
    .filter(Boolean)
    .join(", ");
  return INQUIRE_FORM.unit.message(details ? `${title} (${details})` : title);
}

/**
 * `unitId` + `unitLabel` for POST /contact, only for a unit with a valid id
 * (empty object otherwise).
 */
export function unitPayloadFields(unit) {
  const unitId = String(unit?._id ?? unit?.id ?? "");
  if (!unit || !OBJECT_ID_PATTERN.test(unitId)) return {};
  return { unitId, unitLabel: buildUnitLabel(unit) };
}
