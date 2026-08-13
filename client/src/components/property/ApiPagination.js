"use client";

export default function ApiPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) {
  if (!totalPages || totalPages <= 1) {
    return total > 0 ? (
      <p className="mt10 pagination_page_count text-center">
        Showing {total} {total === 1 ? "property" : "properties"}
      </p>
    ) : null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mbp_pagination text-center">
      <ul className="page_navigation">
        <li className="page-item">
          <span
            className="page-link pointer"
            onClick={() => page > 1 && onPageChange(page - 1)}
          >
            <span className="fas fa-angle-left" />
          </span>
        </li>

        {pages.map((pageNumber) => (
          <li
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={pageNumber === page ? "active page-item" : "page-item"}
          >
            <span className="page-link pointer">{pageNumber}</span>
          </li>
        ))}

        <li className="page-item pointer">
          <span
            className="page-link"
            onClick={() => page < totalPages && onPageChange(page + 1)}
          >
            <span className="fas fa-angle-right" />
          </span>
        </li>
      </ul>
      <p className="mt10 pagination_page_count text-center">
        {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}{" "}
        properties
      </p>
    </div>
  );
}
