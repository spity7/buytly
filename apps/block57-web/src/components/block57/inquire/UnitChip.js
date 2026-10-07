"use client";

import { CloseIcon } from "@/components/block57/ui/icons";
import { INQUIRE_FORM } from "@/content/block57/inquire";
import styles from "./UnitChip.module.scss";

const COPY = INQUIRE_FORM.unit;

/**
 * The residence an inquiry is about (`/inquire/?unit=<id>`).
 * States: "none" (renders nothing) · "loading" · "found" · "missing" (not a
 * public unit) · "error" (project could not be loaded).
 */
export default function UnitChip({ state, unit, onRemove }) {
  if (state === "none") return null;

  if (state === "loading") {
    return (
      <div className={styles.slot}>
        <p className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          {COPY.loading}
        </p>
      </div>
    );
  }

  if (state !== "found" || !unit) {
    return (
      <div className={styles.slot}>
        <p className={styles.notice} role="status">
          {state === "error" ? COPY.error : COPY.missing}
        </p>
      </div>
    );
  }

  const title = String(unit.title ?? "").trim();
  const building = String(unit.building ?? "").trim();

  return (
    <div className={styles.slot}>
      <p className={styles.chip}>
        <span className={styles.text}>
          {COPY.prefix} <strong className={styles.title}>{title}</strong>
          {building ? ` (Block ${building})` : null}
        </span>
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={COPY.remove(title)}
        >
          <CloseIcon size={14} />
        </button>
      </p>
    </div>
  );
}
