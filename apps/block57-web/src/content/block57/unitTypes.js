// The six residence types of block-57.com (verbatim live copy:
// phase0/spec/copy-deck.md#type.*). Order = the live home "Find your fit" grid;
// the Apartments index shows them reversed (APARTMENTS_INDEX_ORDER).
//
// Two identifiers per type — never mix them up:
//   slug          page URL segment, /apartments/<slug>/ (the live WordPress
//                 slugs: "1-bedroom", "2-bedroom", …)
//   catalogValue  the API property type stored on every unit (`unit.type`,
//                 seed server/scripts/seed/block57.js: "one-bedroom", …)
// Resolve a unit with getUnitTypeByCatalogValue(unit.type); resolve a route
// with getUnitType(slug).
//
// Fields
//   label / pluralLabel   card title, H1, last breadcrumb / table caption
//   categoryName          breadcrumb level 3 (live category term, plain text)
//   beds / baths          meta pill on the cards ("BED 4 · BATH 4")
//   image                 asset id (lib/block57/assets.js): card + hero image
//   overviewTitle         overview heading ("Apartment overview" / "Penthouse")
//   description           overview lead; "\n" = a hard line break on live
//   areaRange             "With areas starting from" value
//   specs                 the two spec paragraphs between the green dividers
//   floorPlan             asset id of the static floor plan (overview column)
//   showInquireRow        black INQUIRE pill under the overview (Penthouse)
//   tourId                CloudPano 360° tour id, or null (no tour block)
//   photos / photoColumns "Apartment photos" grid: asset ids in live order,
//                         and its column count (same on phones)
//
// Client-copy corrections (unambiguous typos only, listed for approval):
// Townhouse "Also t is" → "Also it is"; 1 Bedroom "Master Bedroom• En-Suite"
// → "Master Bedroom • En-Suite"; final full stop added to the Townhouse and
// Urban Villa descriptions.

export const UNIT_TYPES = [
  {
    slug: "executive-studio",
    catalogValue: "executive-studio",
    label: "Executive Studio",
    pluralLabel: "Executive Studios",
    categoryName: "Studio",
    beds: 1,
    baths: 1,
    image: "img-009",
    overviewTitle: "Apartment overview",
    description:
      "Designed for the discerning individual or young professional, our Studios offer a seamless blend of comfort, style, and convenience. With sleek, open-plan layouts and premium finishes, each Studio is a private sanctuary that maximizes space without compromising on elegance.",
    areaRange: "36 sqm. to 51 sqm.",
    specs: [
      "Perfect for those who value simplicity and sophistication, these units feature a dedicated entrance, spacious living area, modern kitchen, and private bathroom — all crafted to elevate everyday living.",
      "• Open Kitchen\n• Living Area\n• Main Bathroom\n• Bedroom",
    ],
    floorPlan: "img-014",
    showInquireRow: false,
    tourId: "yKakjpPjB",
    photos: ["img-069", "img-009", "img-062", "img-047", "img-050"],
    photoColumns: 2,
  },
  {
    slug: "1-bedroom",
    catalogValue: "one-bedroom",
    label: "1 Bedroom",
    pluralLabel: "1 Bedroom Apartments",
    categoryName: "One Bedroom",
    beds: 1,
    baths: 2,
    image: "img-010",
    overviewTitle: "Apartment overview",
    description:
      "For those seeking a balance of privacy and urban proximity, our One-Bedroom Apartments deliver a refined living experience. Designed with precision, each unit offers an open-concept layout that maximizes flow and natural light, while maintaining a sense of calm and seclusion.",
    areaRange: "51 sqm. to 73 sqm.",
    specs: [
      "A perfect retreat for couples or professionals, these apartments\ninclude a spacious bedroom with en-suite bathroom, a well-appointed kitchen, and a comfortable living area — all within a secure, exclusive compound.",
      "• Master Bedroom • En-Suite Bathroom • Shared Washroom\n• Open Kitchen • Living Area",
    ],
    floorPlan: "img-012",
    showInquireRow: false,
    tourId: "2Do7ucp0R",
    photos: [
      "img-072",
      "img-067",
      "img-070",
      "img-010",
      "img-066",
      "img-063",
      "img-061",
      "img-058",
      "img-057",
      "img-049",
      "img-052",
      "img-056",
      "img-046",
      "img-005",
    ],
    photoColumns: 2,
  },
  {
    slug: "2-bedroom",
    catalogValue: "two-bedroom",
    label: "2 Bedroom",
    pluralLabel: "2 Bedroom Apartments",
    categoryName: "Two Bedroom",
    beds: 2,
    baths: 2,
    image: "img-005",
    overviewTitle: "Apartment overview",
    description:
      "Ideal for growing families or those who entertain frequently, our Two-Bedroom Apartments combine generous space with thoughtful design. Featuring a separate master bedroom with en-suite bathroom and a second bedroom served by a shared bathroom, these units offer both privacy and functionality.",
    areaRange: "80 sqm. to 104 sqm.",
    specs: [
      "The open-plan living and dining area flows seamlessly into the modern kitchen, creating a vibrant heart of the home — perfect for daily life or hosting guests.",
      "• 2nd Bedroom • Open Kitchen • Shared Washroom\n• Master Bedroom • En-Suite Bathroom • Living Area",
    ],
    floorPlan: "img-013",
    showInquireRow: false,
    tourId: "2Do7ucp0R",
    photos: [
      "img-066",
      "img-067",
      "img-005",
      "img-046",
      "img-056",
      "img-058",
      "img-061",
      "img-010",
      "img-070",
      "img-063",
      "img-052",
    ],
    photoColumns: 2,
  },
  {
    slug: "urban-villa",
    catalogValue: "urban-villa",
    label: "Urban Villa",
    pluralLabel: "Urban Villas",
    categoryName: "Urban Villa",
    beds: 3,
    baths: 3,
    image: "img-006",
    overviewTitle: "Apartment overview",
    description:
      "Our Villas redefine vertical living with a grand, two-level design that blends luxury and practicality. With a majestic 6-meter high ceiling in the living area, these duplexes offer a dramatic, airy feel — perfect for those who appreciate volume and Natural Light.",
    areaRange: "205 sqm. to 215 sqm.",
    specs: [
      "The ground floor includes a spacious living and dining area, open kitchen, maid’s room, and guest bathroom. The upper level features three bedrooms — including a master suite with en-suite bathroom — and a shared bathroom, creating a private haven above the city.",
      "• Ground Floor: Living, Dining area, Kitchen, Maid Room, Guest WC\n• Upper Floor: Three Bedrooms (Master with En-Suite), Shared Bathroom\n• Grand 6m High Ceiling in Living Area\n• Private Garden Access (for some units)",
    ],
    floorPlan: "img-016",
    showInquireRow: false,
    tourId: null,
    photos: [
      "img-023",
      "img-048",
      "img-043",
      "img-024",
      "img-053",
      "img-059",
      "img-007",
      "img-071",
      "img-008",
      "img-068",
    ],
    photoColumns: 3,
  },
  {
    slug: "townhouse",
    catalogValue: "townhouse",
    label: "Townhouse",
    pluralLabel: "Townhouses",
    categoryName: "Townhouse",
    beds: 3,
    baths: 4,
    image: "img-007",
    overviewTitle: "Apartment overview",
    description:
      "Designed for urban living at its most serene, our townhouses pair sleek, contemporary lines with Cantonments’ quiet charm. Private outdoor spaces and seamless indoor flow create a retreat that’s both connected to Accra’s pulse and distinctly your own.",
    areaRange: "191 sqm. to 313 sqm.",
    specs: [
      "Features a dedicated entrance point and car parking, with garden and terrace at the back. Also it is available to residents.",
      "• 3 Bedrooms • Kitchen • Maid Room\n• 2 Living Areas • Dining • Guest Washroom\n• Garden and terrace at the back\n• 1 or 2 underground parking spots\n• Dedicated entrance with car parking",
    ],
    floorPlan: "img-015",
    showInquireRow: false,
    // Live has a tour block here, hidden at every breakpoint: not rendered.
    tourId: null,
    photos: [
      "img-055",
      "img-048",
      "img-043",
      "img-051",
      "img-054",
      "img-007",
      "img-059",
      "img-006",
      "img-068",
      "img-008",
    ],
    photoColumns: 2,
  },
  {
    slug: "penthouse",
    catalogValue: "penthouse",
    label: "Penthouse",
    pluralLabel: "Penthouses",
    categoryName: "Penthouse",
    // Live cards read "BATH 4 · BED 4"; shown in the usual order (OQ-12).
    beds: 4,
    baths: 4,
    image: "img-008",
    overviewTitle: "Penthouse",
    description:
      "At the crown of Block 57, our Penthouses offer the ultimate expression of luxury and exclusivity. With three bedrooms — including a master suite with dressing room and en-suite bathroom — these sky homes are designed for those who expect nothing but the best.\nFeaturing a private swimming pool on the rooftop terrace, panoramic views of Cantonments, and a full-height living area, each Penthouse is a personal retreat above the city — where privacy, comfort, and prestige converge.",
    areaRange: "240 sqm. to 380 sqm.",
    specs: [
      "Upper Floor: Master Bedroom with Dressing Room & En-Suite Bathrooms, Two Bedrooms with En-Suite Bathrooms",
      "Lower Floor: Entrance, Living Area, Kitchen, Guest Bathroom",
    ],
    floorPlan: "img-017",
    showInquireRow: true,
    tourId: "yKakjpPjB",
    photos: ["img-008", "img-068", "img-007", "img-059", "img-055", "img-043"],
    photoColumns: 3,
  },
];

/** Page slugs (generateStaticParams, sitemap). */
export const UNIT_TYPE_SLUGS = UNIT_TYPES.map((type) => type.slug);

const normalise = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const BY_SLUG = new Map(UNIT_TYPES.map((type) => [type.slug, type]));
const BY_CATALOG_VALUE = new Map(
  UNIT_TYPES.map((type) => [type.catalogValue, type]),
);

/** Unit type by page slug ("1-bedroom"), or null. */
export function getUnitType(slug) {
  return BY_SLUG.get(normalise(slug)) ?? null;
}

/** Unit type by API catalog value (`unit.type`, "one-bedroom"), or null. */
export function getUnitTypeByCatalogValue(value) {
  return BY_CATALOG_VALUE.get(normalise(value)) ?? null;
}

/**
 * Lenient lookup for values of unknown origin (a catalog value or a slug,
 * e.g. hook arguments): catalog value first, then slug.
 */
export function resolveUnitType(value) {
  return getUnitTypeByCatalogValue(value) ?? getUnitType(value);
}

/** Display label for a unit's `type` (catalog value or slug; falls back to the raw value). */
export function getUnitTypeLabel(value) {
  return resolveUnitType(value)?.label ?? (value ? String(value) : "");
}

/** Public page for a unit type: "/apartments/<slug>/". */
export function getUnitTypeHref(slug) {
  return `/apartments/${slug}/`;
}

/**
 * Inquire form pre-filled with the type (and optionally one unit):
 * "/inquire/?type=1-bedroom&unit=<unit _id>". The inquire page accepts the
 * page slug as well as the catalog value.
 */
export function getUnitTypeInquireHref(slug, unitId) {
  const params = new URLSearchParams();
  if (slug) params.set("type", slug);
  if (unitId) params.set("unit", String(unitId));
  const query = params.toString();
  return query ? `/inquire/?${query}` : "/inquire/";
}
