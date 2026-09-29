"use client";

import Link from "next/link";

/**
 * Centered empty state for property detail sections (reviews, similar listings, etc.).
 * Uses the same visual language as home featured listings empty state.
 */
export default function PropertySectionEmptyState({
  icon = "flaticon-home-1",
  title,
  description,
  actions = [],
  variant = "panel",
  decoration = null,
  className = "",
}) {
  const variantClass =
    variant === "embedded" ? "featured-listings-empty--embedded" : "";

  return (
    <div
      className={`featured-listings-empty bdr1 bdrs12 ${variantClass} ${className}`.trim()}
      role="status"
    >
      {decoration}
      <div className="featured-listings-empty__icon" aria-hidden="true">
        <span className={icon} />
      </div>
      <h3 className="featured-listings-empty__title">{title}</h3>
      {description ? (
        <p className="featured-listings-empty__text">{description}</p>
      ) : null}
      {actions.length > 0 ? (
        <div className="featured-listings-empty__actions">
          {actions.map((action) => {
            const isPrimary = action.variant !== "secondary";
            const classNames = isPrimary ? "ud-btn btn-thm" : "ud-btn2";

            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={classNames}
                >
                  {action.label}
                  <i className="fal fa-arrow-right-long" />
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                className={classNames}
                onClick={action.onClick}
              >
                {action.label}
                <i className="fal fa-arrow-right-long" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PropertyReviewsEmptyDecoration() {
  return (
    <div className="property-reviews-empty__stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <i key={index} className="far fa-star" />
      ))}
    </div>
  );
}
