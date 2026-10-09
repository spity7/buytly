export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive partial match on property title and description.
 */
export function buildPropertyTextFilter(search) {
  const term = search?.trim();
  if (!term) return null;

  const pattern = new RegExp(escapeRegex(term), "i");
  return {
    $or: [{ title: pattern }, { description: pattern }],
  };
}
