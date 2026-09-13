/**
 * GeoJSON Point order: [longitude, latitude].
 */

export function coordinatesToLatLngStrings(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return { latitude: "", longitude: "" };
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
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

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
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

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
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

/** Google Maps embed: prefer saved [lng, lat], else geocode address text. */
export function buildPropertyMapEmbedSrc(location) {
  if (!location) return null;

  const { latitude, longitude } = coordinatesToLatLngStrings(
    location.coordinates,
  );
  if (latitude && longitude) {
    const q = encodeURIComponent(`${latitude},${longitude}`);
    return `https://maps.google.com/maps?q=${q}&t=m&z=14&output=embed&iwloc=near`;
  }

  const query =
    location.address ||
    [location.city, location.country].filter(Boolean).join(", ");
  if (!query?.trim()) return null;

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=14&output=embed&iwloc=near`;
}
