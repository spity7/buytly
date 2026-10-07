"use client";

import { PinIcon } from "@/components/block57/ui/icons";
import { ButtonLink } from "@/components/block57/ui/Button";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { LIFESTYLE_LOCATION, LIFESTYLE_MAP } from "@/content/block57/lifestyle";
import useLocationTarget from "./useLocationTarget";
import styles from "./LocationMap.module.scss";

/**
 * Keyless Google Maps embed in a fixed aspect-ratio box (no layout shift).
 * The iframe is lazy-loaded and only rendered once the project request has
 * settled (see useLocationTarget); until then a quiet map-like placeholder
 * with a pin holds the space. Without JS the placeholder stays and the
 * "Open in Google Maps" link still works.
 */
export default function LocationMap({
  title = LIFESTYLE_MAP.title,
  loadingLabel = LIFESTYLE_LOCATION.mapLoadingLabel,
  className,
}) {
  const { embedSrc } = useLocationTarget();

  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")}>
      <div className={styles.placeholder} aria-hidden="true">
        <span className={styles.pin}>
          <PinIcon size={28} strokeWidth={1.25} />
        </span>
      </div>
      {embedSrc ? (
        <iframe
          key={embedSrc}
          src={embedSrc}
          title={title}
          className={styles.iframe}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <p className={styles.status} role="status">
          {loadingLabel}
        </p>
      )}
    </div>
  );
}

/** "Open in Google Maps" (new tab), pointing at the same place as the map. */
export function MapLink({
  label = LIFESTYLE_LOCATION.mapLinkLabel,
  className,
}) {
  const { mapsUrl } = useLocationTarget();
  return (
    <ButtonLink
      href={mapsUrl}
      variant="text"
      external
      arrow
      className={className}
    >
      {label}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </ButtonLink>
  );
}
