"use client";

import { useRouter } from "next/navigation";
import { buildAuthEntryUrl } from "@/lib/auth/authIntent";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useFavoriteIds } from "@/lib/block57/useFavoriteIds";
import { getUnitAnchorId } from "@/lib/block57/units";
import { HeartIcon } from "./icons";
import styles from "./FavoriteToggle.module.scss";

/**
 * Heart button for one unit. Signed in: toggles the favourite (shared list from
 * useFavoriteIds — one request for the whole page). Signed out: goes to
 * /login/?auth=signin&next=<current page>. Sold units can be removed from
 * favourites but not added (the API only accepts available units).
 *
 * @param {{ unitId: string, unitLabel?: string, status?: string,
 *   size?: "sm"|"md", showLabel?: boolean, className?: string }} props
 */
/**
 * Where sign-in should bring the visitor back: this page, scrolled to the
 * unit's row when the page has one (#unit-<id>), else the current hash.
 */
function returnPathFor(unitId) {
  if (typeof window === "undefined") return undefined;
  const { pathname, search, hash } = window.location;
  const anchor = unitId ? getUnitAnchorId(unitId) : "";
  const target =
    anchor && document.getElementById(anchor) ? `#${anchor}` : hash;
  return `${pathname}${search}${target || ""}`;
}

export default function FavoriteToggle({
  unitId,
  unitLabel,
  status,
  size = "md",
  showLabel = false,
  className,
}) {
  const router = useRouter();
  const { isFavorite, toggle, pendingId, isAuthenticated, isAuthLoading } =
    useFavoriteIds();

  const id = unitId ? String(unitId) : "";
  const active = isFavorite(id);
  const pending = pendingId === id;
  const cannotAdd = status === "sold" && !active && isAuthenticated;
  const name = unitLabel
    ? `Save ${unitLabel} to favourites`
    : "Save to favourites";
  const visibleLabel = active ? "Saved" : "Save";

  async function handleClick() {
    if (!id || pending || isAuthLoading) return;
    if (!isAuthenticated) {
      router.push(
        buildAuthEntryUrl({ tab: "signin", next: returnPathFor(id) }),
      );
      return;
    }
    if (cannotAdd) return;
    try {
      const saved = await toggle(id);
      notifySuccess(
        saved
          ? `${unitLabel || "Residence"} saved to your favourites.`
          : `${unitLabel || "Residence"} removed from your favourites.`,
      );
    } catch (error) {
      notifyError(getApiError(error, "Could not update your favourites."));
    }
  }

  return (
    <button
      type="button"
      className={[
        styles.toggle,
        styles[`size-${size}`],
        showLabel ? styles.withLabel : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={name}
      aria-pressed={active}
      aria-busy={pending || undefined}
      aria-disabled={cannotAdd || undefined}
      title={cannotAdd ? "Sold residences cannot be saved" : name}
      data-active={active ? "true" : undefined}
      onClick={handleClick}
    >
      <HeartIcon filled={active} size={size === "sm" ? 18 : 20} />
      {showLabel ? (
        <span className={styles.label} aria-hidden="true">
          {visibleLabel}
        </span>
      ) : null}
    </button>
  );
}
