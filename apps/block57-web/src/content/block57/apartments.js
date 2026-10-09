// Apartments index (/apartments/) and the shared labels of the six type pages
// (/apartments/<slug>/). Live copy is verbatim (phase0/spec/copy-deck.md);
// strings marked "derived" have no live equivalent (product features: live
// availability, favourites, unit deep links) and need client approval.

export const APARTMENTS_PAGE = {
  title: "Apartments",
  // Derived (live has no meta descriptions).
  metaDescription:
    "Executive Studios, 1 and 2 Bedroom apartments, Urban Villas, Townhouses and Penthouses at Block 57, Cantonments, Accra.",
};

/** Card order on /apartments/ (live: the reverse of the home grid). */
export const APARTMENTS_INDEX_ORDER = [
  "penthouse",
  "townhouse",
  "urban-villa",
  "2-bedroom",
  "1-bedroom",
  "executive-studio",
];

/** Apartment card (home "Find your fit" + /apartments/). */
export const RESIDENCE_CARD_COPY = {
  explore: "explore", // hover circle, CSS uppercase → EXPLORE
  bed: "Bed",
  bath: "Bath",
};

/** Section labels shared by the six type pages. */
export const TYPE_PAGE_COPY = {
  areaLabel: "With areas starting from",
  inquire: "Inquire", // Penthouse row, CSS uppercase → INQUIRE
  tour: { eyebrow: "360 Virtual tour", title: "Modern Living" },
  photos: { title: "Apartment photos" },
  // Derived: the live availability table has no live reference.
  availability: { eyebrow: "availability", title: "Current availability" },
};

/** Availability table (derived labels). */
export const AVAILABILITY_TABLE_COPY = {
  columns: {
    title: "Residence",
    block: "Block",
    level: "Level",
    beds: "Bedrooms",
    baths: "Bathrooms",
    area: "Area",
    status: "Status",
    price: "Price",
    actions: "Actions",
  },
  caption: (pluralLabel) => `${pluralLabel} at Block 57: live availability`,
  floorPlan: "Floor plan",
  floorPlanNumbered: (n) => `Plan ${n}`,
  inquire: "Inquire",
};

/** Live-data states (availability line, table, unit deep links). Derived. */
export const AVAILABILITY_COPY = {
  error: "Live availability is temporarily unavailable.",
  empty:
    "No residences of this type are currently listed. Inquire for availability.",
  unitNotListed: "That residence is no longer listed.",
  resolving: "Finding that residence…",
  countOnRequest: "Availability on request",
  soldOut: "Sold out",
  loading: "Loading availability",
  retry: "Try again",
  dismiss: "Dismiss notice",
};
