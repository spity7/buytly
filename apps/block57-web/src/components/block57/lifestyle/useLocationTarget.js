"use client";

import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import {
  buildPropertyMapEmbedSrc,
  coordinatesToLatLngStrings,
  hasPropertyMapCoordinates,
} from "@/lib/geo/propertyCoordinates";
import { LIFESTYLE_LOCATION, LIFESTYLE_MAP } from "@/content/block57/lifestyle";

/** Google Maps search URL (opens the app on phones, maps.google.com elsewhere). */
export function buildMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Static address search: the server-rendered / no-JS value of `mapsUrl`.
const ADDRESS_MAPS_URL = buildMapsSearchUrl(LIFESTYLE_LOCATION.addressQuery);

/**
 * Where the Lifestyle map points. The loaded project's `location` (managed in
 * the dashboard) wins; until the request settles nothing is embedded, so the
 * iframe loads once with the right pin. If the API fails, the map falls back
 * to the static APPROXIMATE coordinates (content/block57/site.js) and the link
 * to an address search.
 *
 * Shares the cached project query with every other component on the page.
 *
 * @returns {{ ready: boolean, embedSrc: string|null, mapsUrl: string,
 *   source: "project"|"static" }}
 */
export default function useLocationTarget() {
  const { project, isError } = useBlock57Project();
  const ready = Boolean(project) || isError;
  const fromProject = hasPropertyMapCoordinates(project?.location);
  const location = fromProject ? project.location : LIFESTYLE_MAP.location;

  let mapsUrl = ADDRESS_MAPS_URL;
  if (fromProject) {
    const { latitude, longitude } = coordinatesToLatLngStrings(
      location.coordinates,
    );
    mapsUrl = buildMapsSearchUrl(`${latitude},${longitude}`);
  }

  return {
    ready,
    embedSrc: ready ? buildPropertyMapEmbedSrc(location) : null,
    mapsUrl,
    source: fromProject ? "project" : "static",
  };
}
