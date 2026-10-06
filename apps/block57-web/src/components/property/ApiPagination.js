"use client";

export default function ApiPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  itemLabel = "properties",
  itemLabelSingular,
  disabled = false,
}) {
  const singular = itemLabelSingular ?? itemLabel;
  const countLabel = total === 1 ? singular : itemLabel;

  if (!totalPages || totalPages <= 1) {
    return total > 0 ? (
      <p className="mt10 pagination_page_count text-center">
        Showing {total} {countLabel}
      </p>
    ) : null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const goToPage = (nextPage) => {
    if (!disabled) {
      onPageChange(nextPage);
    }
  };

  return (
    <div
      className={`mbp_pagination text-center${disabled ? " mbp_pagination--disabled" : ""}`}
    >
      <ul className="page_navigation">
        <li className="page-item">
          <span
            className={`page-link${disabled ? "" : " pointer"}`}
            onClick={() => page > 1 && goToPage(page - 1)}
            aria-disabled={disabled || page <= 1}
          >
            <span className="fas fa-angle-left" />
          </span>
        </li>

        {pages.map((pageNumber) => (
          <li
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            className={pageNumber === page ? "active page-item" : "page-item"}
          >
            <span className={`page-link${disabled ? "" : " pointer"}`}>
              {pageNumber}
            </span>
          </li>
        ))}

        <li className={`page-item${disabled ? "" : " pointer"}`}>
          <span
            className="page-link"
            onClick={() => page < totalPages && goToPage(page + 1)}
            aria-disabled={disabled || page >= totalPages}
          >
            <span className="fas fa-angle-right" />
          </span>
        </li>
      </ul>
      <p className="mt10 pagination_page_count text-center">
        {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}{" "}
        {itemLabel}
      </p>
    </div>
  );
}
