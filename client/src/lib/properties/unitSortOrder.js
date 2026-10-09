export const DEFAULT_SORT_ORDER = 999;
export const DEFAULT_UNIT_SORT_ORDER = DEFAULT_SORT_ORDER;
export const DEFAULT_CATALOG_SORT_ORDER = DEFAULT_SORT_ORDER;

export function formatSortOrderForInput(
  value,
  defaultOrder = DEFAULT_SORT_ORDER,
) {
  if (value == null || value === "") {
    return String(defaultOrder);
  }
  return String(value);
}

export function resolveSortOrderForPayload(
  rawValue,
  defaultOrder = DEFAULT_SORT_ORDER,
) {
  const parsed = Number.parseInt(String(rawValue ?? "").trim(), 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return defaultOrder;
}

export function formatUnitSortOrderForInput(value) {
  return formatSortOrderForInput(value, DEFAULT_UNIT_SORT_ORDER);
}

export function resolveUnitSortOrderForPayload(rawValue) {
  return resolveSortOrderForPayload(rawValue, DEFAULT_UNIT_SORT_ORDER);
}

export function formatCatalogSortOrderForInput(value) {
  return formatSortOrderForInput(value, DEFAULT_CATALOG_SORT_ORDER);
}

export function resolveCatalogSortOrderForPayload(rawValue) {
  return resolveSortOrderForPayload(rawValue, DEFAULT_CATALOG_SORT_ORDER);
}
