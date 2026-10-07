import { getUnitStatusLabel } from "@/lib/block57/units";
import styles from "./StatusPill.module.scss";

/**
 * "Available" (status active) / "Sold" (status sold). Other statuses render
 * nothing: they must never reach the public UI.
 */
export default function StatusPill({ status, className }) {
  const label = getUnitStatusLabel(status);
  if (!label) return null;
  return (
    <span
      className={[styles.pill, styles[status], className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
