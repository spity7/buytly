/**
 * Scans paginated list API pages until `highlightId` is found.
 * Returns the 1-based page number, or null when not found.
 */
export async function findPaginatedHighlightPage({
  fetchPage,
  highlightId,
  getItemId = (item) => item._id,
  maxPages = 50,
}) {
  if (!highlightId) return null;

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await fetchPage(page);
    const items = result.items ?? result.data ?? [];
    const found = items.some(
      (item) => String(getItemId(item)) === String(highlightId),
    );

    if (found) return page;

    const totalPages = result.pagination?.totalPages ?? 1;
    if (page >= totalPages) break;
  }

  return null;
}
