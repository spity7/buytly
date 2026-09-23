/** Property type slugs that cannot be edited, deleted, or deactivated (platform rules). */
export const PROTECTED_PROPERTY_TYPE_VALUES = [];

/** Default catalog entries bootstrapped when collections are empty. */
export const DEFAULT_PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", sortOrder: 1 },
  { value: "villa", label: "Villa", sortOrder: 2 },
  { value: "duplex", label: "Duplex", sortOrder: 3 },
  { value: "penthouse", label: "Penthouse", sortOrder: 4 },
  { value: "townhouse", label: "Townhouse", sortOrder: 5 },
  { value: "office", label: "Office", sortOrder: 6 },
  { value: "shop", label: "Shop", sortOrder: 7 },
  { value: "building", label: "Building", sortOrder: 8 },
  { value: "land", label: "Land", sortOrder: 9 },
  { value: "chalet", label: "Chalet", sortOrder: 10 },
];

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
