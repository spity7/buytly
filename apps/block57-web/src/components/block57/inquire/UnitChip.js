import MetaPill from "@/components/block57/ui/MetaPill";
import { TimesIcon } from "@/components/block57/ui/icons";
import { INQUIRE_FORM } from "@/content/block57/inquire";
import { describeUnitShort } from "./unit";
import styles from "./UnitChip.module.scss";

const COPY = INQUIRE_FORM.unit;

/**
 * The residence an inquiry is about (`/inquire/?unit=<id>`), above the first
 * field: a meta-style pill `REGARDING  B-204 · BLOCK B  ×` (DESIGN_SPEC §5).
 * States: "none" (renders nothing) · "loading" · "found" · "missing" (not a
 * public unit) · "error" (project could not be loaded); the last three are a
 * line of body copy.
 */
export default function UnitChip({ state, unit, onRemove }) {
  if (state === "none") return null;

  if (state !== "found" || !unit) {
    const text =
      state === "loading"
        ? COPY.loading
        : state === "error"
          ? COPY.error
          : COPY.missing;
    return (
      <p className={styles.status} role="status">
        {text}
      </p>
    );
  }

  const title = String(unit.title ?? "").trim();

  return (
    <MetaPill as="p" className={styles.chip}>
      <span className={styles.label}>{COPY.prefix}</span>
      <span className={styles.value}>{describeUnitShort(unit)}</span>
      <button
        type="button"
        className={styles.remove}
        onClick={onRemove}
        aria-label={COPY.remove(title)}
      >
        <TimesIcon size={10} />
      </button>
    </MetaPill>
  );
}
