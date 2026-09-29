/** Cities aligned with demo seed data (`server/scripts/seed/catalog.js`). */
export const LISTING_CITIES = ["Dubai", "Abu Dhabi", "Sharjah"];

export const LISTING_CITY_OPTIONS = [
  { value: "All Cities", label: "All Cities" },
  ...LISTING_CITIES.map((city) => ({ value: city, label: city })),
];
