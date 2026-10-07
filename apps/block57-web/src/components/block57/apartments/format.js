// Small display helpers for the Apartments pages (table cells, media keys).
// Shared helpers (availability counts, index labels) live in @/lib/block57/format.

/** Bedrooms cell: 0 → "Studio", 2 → "2", missing → "—". */
export function formatBedroomsShort(bedrooms) {
  if (bedrooms == null || bedrooms === "") return "—";
  const n = Number(bedrooms);
  if (Number.isNaN(n)) return "—";
  return n === 0 ? "Studio" : String(n);
}

/** Plain count cell (bathrooms): 2 → "2", missing → "—". */
export function formatCountShort(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : String(n);
}

/** Building cell: "a" → "A", missing → "—". */
export function formatBuildingShort(building) {
  const value = String(building ?? "").trim();
  return value ? value.toUpperCase() : "—";
}

/** Stable de-duplication key for a signed media/plan URL (ignores the signature). */
export function mediaKey(item) {
  if (item?.gcsKey) return `gcs:${item.gcsKey}`;
  const url = String(item?.url ?? item?.src ?? "");
  return `url:${url.split("?")[0]}`;
}
