/**
 * GeoJSON Point order: [longitude, latitude].
 */

/** Null Island / unset placeholder stored as [0, 0]. */
export function isPlaceholderMapPoint(lng, lat) {
  return lng === 0 && lat === 0;
}

export function coordinatesToLatLngStrings(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return { latitude: "", longitude: "" };
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (
    !isValidLatitude(lat) ||
    !isValidLongitude(lng) ||
    isPlaceholderMapPoint(lng, lat)
  ) {
    return { latitude: "", longitude: "" };
  }

  return {
    latitude: String(lat),
    longitude: String(lng),
  };
}

export function latLngStringsToGeoJsonCoordinates(longitude, latitude) {
  const lng = Number(longitude);
  const lat = Number(latitude);

  if (
    !isValidLatitude(lat) ||
    !isValidLongitude(lng) ||
    isPlaceholderMapPoint(lng, lat)
  ) {
    return null;
  }

  return [lng, lat];
}

export function parseLatLngStrings(latitude, longitude) {
  if (
    latitude === "" ||
    longitude === "" ||
    latitude == null ||
    longitude == null
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !isValidLatitude(lat) ||
    !isValidLongitude(lng) ||
    isPlaceholderMapPoint(lng, lat)
  ) {
    return null;
  }

  return { lat, lng };
}

function isValidLatitude(value) {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(value) {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    value >= -180 &&
    value <= 180
  );
}

/** True when listing has valid GeoJSON [lng, lat] coordinates. */
export function hasPropertyMapCoordinates(location) {
  if (!location) return false;
  const { latitude, longitude } = coordinatesToLatLngStrings(
    location.coordinates,
  );
  return latitude !== "" && longitude !== "";
}

/** Google Maps embed iframe src; only when saved coordinates exist. */
export function buildPropertyMapEmbedSrc(location) {
  if (!hasPropertyMapCoordinates(location)) return null;

  const { latitude, longitude } = coordinatesToLatLngStrings(
    location.coordinates,
  );
  const q = encodeURIComponent(`${latitude},${longitude}`);
  return `https://maps.google.com/maps?q=${q}&t=m&z=14&output=embed&iwloc=near`;
}
