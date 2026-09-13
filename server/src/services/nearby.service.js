const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const RADIUS_METERS = 5000;
const MAX_PER_CATEGORY = 5;
const OVERPASS_TIMEOUT_MS = 25_000;
const OVERPASS_USER_AGENT =
  process.env.OVERPASS_USER_AGENT || "Buytly/1.0 (+https://buytly.local)";

function getOverpassEndpoints() {
  const configured = process.env.OVERPASS_URL?.trim();
  if (!configured) {
    return DEFAULT_OVERPASS_ENDPOINTS;
  }

  return [
    configured,
    ...DEFAULT_OVERPASS_ENDPOINTS.filter((url) => url !== configured),
  ];
}

const CATEGORIES = [
  {
    id: "education",
    title: "Education",
    filters: [
      ["amenity", "school"],
      ["amenity", "kindergarten"],
      ["amenity", "college"],
      ["amenity", "university"],
    ],
  },
  {
    id: "health",
    title: "Health & Medical",
    filters: [
      ["amenity", "hospital"],
      ["amenity", "clinic"],
      ["amenity", "doctors"],
      ["amenity", "pharmacy"],
    ],
  },
  {
    id: "transportation",
    title: "Transportation",
    filters: [
      ["railway", "station"],
      ["public_transport", "station"],
      ["highway", "bus_stop"],
      ["amenity", "bus_station"],
    ],
  },
];

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => (value * Math.PI) / 180;

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
};

const getElementCoords = (element) => {
  if (element.lat != null && element.lon != null) {
    return { lat: element.lat, lng: element.lon };
  }

  if (element.center?.lat != null && element.center?.lon != null) {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
};

const getElementName = (tags = {}) =>
  tags.name || tags["name:en"] || tags.operator || "Unnamed place";

const getElementSubtitle = (tags = {}, categoryId) => {
  if (categoryId === "education") {
    return tags["isced:level"] ? `Level ${tags["isced:level"]}` : "School";
  }

  if (categoryId === "health") {
    return tags.healthcare || tags.amenity || "Medical facility";
  }

  return (
    tags.railway ||
    tags.public_transport ||
    tags.highway ||
    tags.amenity ||
    "Transit"
  );
};

const buildOverpassQuery = (lat, lng) => {
  const filterQueries = CATEGORIES.flatMap((category) =>
    category.filters.map(
      ([key, value]) =>
        `  nwr["${key}"="${value}"](around:${RADIUS_METERS},${lat},${lng});`,
    ),
  ).join("\n");

  return `[out:json][timeout:25];
(
${filterQueries}
);
out center;`;
};

const categorizeElements = (elements, originLat, originLng) => {
  const grouped = Object.fromEntries(
    CATEGORIES.map((category) => [category.id, []]),
  );

  for (const element of elements) {
    const tags = element.tags || {};
    const coords = getElementCoords(element);
    if (!coords) continue;

    const category = CATEGORIES.find((item) =>
      item.filters.some(([key, value]) => tags[key] === value),
    );
    if (!category) continue;

    const distanceKm = haversineKm(
      originLat,
      originLng,
      coords.lat,
      coords.lng,
    );

    grouped[category.id].push({
      name: getElementName(tags),
      subtitle: getElementSubtitle(tags, category.id),
      distanceKm,
      distanceLabel: formatDistance(distanceKm),
    });
  }

  return CATEGORIES.map((category) => {
    const seen = new Set();
    const places = grouped[category.id]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .filter((place) => {
        const key = `${place.name}|${place.subtitle}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_PER_CATEGORY);

    return {
      title: category.title,
      places,
    };
  });
};

async function requestOverpass(query, endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": OVERPASS_USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(
      `Overpass request failed with status ${response.status} (${endpoint})`,
    );
  }

  if (!contentType.includes("json")) {
    const body = await response.text();
    throw new Error(
      `Overpass returned non-JSON from ${endpoint}: ${body.slice(0, 120)}`,
    );
  }

  return response.json();
}

export const nearbyService = {
  async fetchNearbyPlaces(lat, lng) {
    const query = buildOverpassQuery(lat, lng);
    const endpoints = getOverpassEndpoints();
    let lastError;

    for (const endpoint of endpoints) {
      try {
        const payload = await requestOverpass(query, endpoint);
        const categories = categorizeElements(payload.elements || [], lat, lng);

        return {
          categories,
          source: "openstreetmap",
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error("Overpass request failed");
  },
};
