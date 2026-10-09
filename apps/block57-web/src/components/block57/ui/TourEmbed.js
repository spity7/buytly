import styles from "./TourEmbed.module.scss";

/** CloudPano tour page for a share id (TO VERIFY: inferred from the live share script). */
export function cloudPanoTourUrl(tourId) {
  return `https://app.cloudpano.com/tours/${encodeURIComponent(tourId)}`;
}

/**
 * 360° virtual tour (CloudPano): a lazy iframe, 100% wide × 500px, on a
 * #F6F1EA placeholder of the same size (nothing shifts while it loads), with a
 * visible link to open the tour in a new tab in case the embed is blocked.
 * Tour ids: home "V1az0GjJk"; Penthouse + Executive Studio "yKakjpPjB";
 * 1 + 2 Bedroom "2Do7ucp0R".
 *
 * @param {{ tourId: string, title?: string, className?: string }} props
 */
export default function TourEmbed({
  tourId,
  title = "Block 57 360° virtual tour",
  className,
}) {
  const url = cloudPanoTourUrl(tourId);
  return (
    <div className={[styles.tour, className].filter(Boolean).join(" ")}>
      <div className={styles.frame}>
        <iframe
          src={url}
          title={title}
          loading="lazy"
          allow="fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking"
          allowFullScreen
          className={styles.iframe}
        />
      </div>
      <a
        href={url}
        className={styles.fallback}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open the 360° tour in a new tab
      </a>
    </div>
  );
}
