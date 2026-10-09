import { PinIcon } from "@/components/block57/ui/icons";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { CONTACT_MAP } from "@/content/block57/contact";
import { COORDINATES } from "@/content/block57/site";
import styles from "./ContactMap.module.scss";

const LAT_LNG = `${COORDINATES.lat},${COORDINATES.lng}`;

/** Keyless Google Maps embed centred on (and pinning) the project. */
const EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(LAT_LNG)}&t=m&z=${CONTACT_MAP.zoom}&hl=en&output=embed`;
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LAT_LNG)}`;

/**
 * `contact.map` (DESIGN_SPEC §4.8.3): full-bleed map, 800px tall at every
 * width. The iframe is lazy; underneath it a same-size placeholder with a pin
 * and an "Open in Google Maps" link shows while it loads (or if Google Maps
 * is blocked). The live embed pins a nearby POI labelled "Hotel"; this one
 * pins the project coordinates (site.js COORDINATES, OQ-06).
 */
export default function ContactMap() {
  return (
    <div className={styles.map}>
      <div className={styles.placeholder}>
        <PinIcon size={32} strokeWidth={1.25} className={styles.pin} />
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {CONTACT_MAP.openLabel}
          <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
        </a>
      </div>
      <iframe
        src={EMBED_SRC}
        title={CONTACT_MAP.title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className={styles.frame}
      />
    </div>
  );
}
