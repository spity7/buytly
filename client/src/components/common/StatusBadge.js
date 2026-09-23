import {
  getStatusBadgeClassName,
  getStatusBadgeLabel,
} from "@/lib/statusBadges";

/**
 * Unified status pill with a leading indicator dot.
 *
 * @param {object} props
 * @param {string} [props.status]
 * @param {"listing"|"booking"|"transaction"|"account"} [props.domain]
 * @param {boolean} [props.trash]
 * @param {boolean} [props.isActive] — account domain
 * @param {boolean} [props.isDeleted] — account domain
 * @param {string} [props.label] — override display text
 * @param {string} [props.tone] — optional visual tone override (e.g. neutral)
 * @param {string} [props.className]
 */
export default function StatusBadge({
  status,
  domain = "listing",
  trash = false,
  isActive,
  isDeleted,
  label,
  tone,
  className = "",
}) {
  const classNames = [
    getStatusBadgeClassName({
      status,
      domain,
      trash,
      isActive,
      isDeleted,
      tone,
    }),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const text = getStatusBadgeLabel(status, {
    domain,
    trash,
    isActive,
    isDeleted,
    label,
  });

  return (
    <span className={classNames}>
      <span className="status-badge__dot" aria-hidden="true" />
      <span className="status-badge__label">{text}</span>
    </span>
  );
}
