/** Property type slugs that cannot be edited, deleted, or deactivated (platform rules). */
export const PROTECTED_PROPERTY_TYPE_VALUES = [];

/** Legacy defaults — no longer auto-inserted; kept for one-off prune script reference only. */
export const LEGACY_BOOTSTRAP_PROPERTY_TYPE_VALUES = [
  "apartment",
  "villa",
  "duplex",
  "penthouse",
  "townhouse",
  "office",
  "shop",
  "building",
  "land",
  "chalet",
];

/** Property types are admin- or seed-managed only (empty bootstrap). */
export const DEFAULT_PROPERTY_TYPES = [];

export const DEFAULT_AMENITIES = [
  { value: "Parking", label: "Parking", sortOrder: 1 },
  { value: "Elevator", label: "Elevator", sortOrder: 2 },
  { value: "Balcony", label: "Balcony", sortOrder: 3 },
  { value: "Terrace", label: "Terrace", sortOrder: 4 },
  { value: "Garden", label: "Garden", sortOrder: 5 },
  { value: "Swimming Pool", label: "Swimming Pool", sortOrder: 6 },
  { value: "Gym", label: "Gym", sortOrder: 7 },
  { value: "Security", label: "Security", sortOrder: 8 },
  { value: "Generator", label: "Generator", sortOrder: 9 },
  { value: "Central AC", label: "Central AC", sortOrder: 10 },
  { value: "Furnished", label: "Furnished", sortOrder: 11 },
  { value: "Sea View", label: "Sea View", sortOrder: 12 },
  { value: "Mountain View", label: "Mountain View", sortOrder: 13 },
  { value: "Smart Home", label: "Smart Home", sortOrder: 14 },
  { value: "Pet Friendly", label: "Pet Friendly", sortOrder: 15 },
];
