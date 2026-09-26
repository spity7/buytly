"use client";

/**
 * Section heading for property/project detail widgets (icon + title).
 */
export default function PsWidgetTitle({
  icon,
  children,
  className = "",
  size = "default",
}) {
  const Tag = size === "compact" ? "h6" : "h4";
  const sizeClass =
    size === "compact"
      ? "ps-widget-title ps-widget-title--compact listing-contact-section__title mb0"
      : "ps-widget-title mb30";

  return (
    <Tag className={`title fz17 ${sizeClass} ${className}`.trim()}>
      <span className="ps-widget-title__icon" aria-hidden="true">
        <span className={icon} />
      </span>
      <span className="ps-widget-title__text">{children}</span>
    </Tag>
  );
}
