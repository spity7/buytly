import { SINGLE_PROJECT_UNIT_TYPE } from "../projects/project-cardinality.js";

/** Property type slugs required by platform rules (always present & non-deletable). */
export const PROTECTED_PROPERTY_TYPE_VALUES = [SINGLE_PROJECT_UNIT_TYPE];

/** Default catalog entries bootstrapped when collections are empty. */
export const DEFAULT_PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", sortOrder: 1 },
  { value: "villa", label: "Villa", sortOrder: 2 },
  { value: "townhouse", label: "Townhouse", sortOrder: 3 },
  { value: "land", label: "Land", sortOrder: 4 },
  { value: "commercial", label: "Commercial", sortOrder: 5 },
  { value: "duplex", label: "Duplex", sortOrder: 6 },
  { value: "studio", label: "Studio", sortOrder: 7 },
];

export const DEFAULT_AMENITIES = [
  { value: "Air Conditioning", label: "Air Conditioning", sortOrder: 1 },
  { value: "Barbeque", label: "Barbeque", sortOrder: 2 },
  { value: "Dryer", label: "Dryer", sortOrder: 3 },
  { value: "Gym", label: "Gym", sortOrder: 4 },
  { value: "Lawn", label: "Lawn", sortOrder: 5 },
  { value: "Microwave", label: "Microwave", sortOrder: 6 },
  { value: "Outdoor Shower", label: "Outdoor Shower", sortOrder: 7 },
  { value: "Refrigerator", label: "Refrigerator", sortOrder: 8 },
  { value: "Swimming Pool", label: "Swimming Pool", sortOrder: 9 },
  { value: "TV Cable", label: "TV Cable", sortOrder: 10 },
  { value: "Washer", label: "Washer", sortOrder: 11 },
  { value: "WiFi", label: "WiFi", sortOrder: 12 },
];
