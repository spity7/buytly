// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
// `slug` doubles as the catalog property-type value stored on each unit (`unit.type`)
// and as the WordPress URL segment (/apartments/<slug>/). Types without verified
// long copy carry one neutral sentence derived from the block descriptions.
//
// Media (all empty until the real Block 57 renders exist — never stock images):
//   heroImage:  "/images/block57/…" | null   (null → <MediaFrame> placeholder)
//   images:     [{ src, alt, caption? }]     static gallery; when empty the page
//                                            shows the units' live API images
//   floorPlans: [{ src, title, alt? }]       static plans, shown before the
//                                            units' live API floor plans

export const UNIT_TYPES = [
  {
    slug: "executive-studio",
    label: "Executive Studio",
    pluralLabel: "Executive Studios",
    catalogValue: "executive-studio",
    blocks: ["A", "B", "C"],
    summary: "Well-planned studios in Blocks A, B and C.",
    description: [
      "Executive studios are found in all three blocks: above the townhouses in Block A, among the mid-level apartments of Block B and on the lower floors of Block C.",
    ],
    // Highlights derived from the verified block descriptions.
    highlights: [
      "Block A — above the townhouses",
      "Block B — mid-level apartments",
      "Block C — lower floors",
    ],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "Studio",
  },
  {
    slug: "one-bedroom",
    label: "1 Bedroom",
    pluralLabel: "1 Bedroom Apartments",
    catalogValue: "one-bedroom",
    blocks: ["A", "B", "C"],
    summary: "One-bedroom apartments in Blocks A, B and C.",
    description: [
      "One-bedroom apartments sit above the townhouses in Block A, among the mid-level residences of Block B and on the lower floors of Block C.",
    ],
    // Highlights derived from the verified block descriptions.
    highlights: [
      "Block A — above the townhouses",
      "Block B — mid-level apartments",
      "Block C — lower floors",
    ],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "1 Bedroom",
  },
  {
    slug: "two-bedroom",
    label: "2 Bedroom",
    pluralLabel: "2 Bedroom Apartments",
    catalogValue: "two-bedroom",
    blocks: ["B"],
    summary: "Two-bedroom residences in Block B.",
    description: [
      "Two-bedroom residences are part of Block B's curated mix of mid-level apartments, offering flexibility, comfort and elevated living for professionals, couples and growing households.",
    ],
    // Highlights derived from the verified Block B description.
    highlights: [
      "Block B — mid-level apartments",
      "For professionals, couples and growing households",
    ],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "2 Bedroom",
  },
  {
    slug: "townhouse",
    label: "Townhouse",
    pluralLabel: "Townhouses",
    catalogValue: "townhouse",
    blocks: ["A"],
    summary: "Ground-floor homes with private gardens in Block A.",
    description: [
      "Block A is anchored by ground-floor townhouses with private gardens, offering a sense of space and privacy rarely found in apartment living.",
    ],
    highlights: ["Ground floor", "Private garden", "Block A"],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "Townhouse",
  },
  {
    slug: "urban-villa",
    label: "Urban Villa",
    pluralLabel: "Urban Villas",
    catalogValue: "urban-villa",
    blocks: ["B"],
    summary: "Two-level duplex villas in Block B, from 205 to 215 sqm.",
    description: [
      "The Villas redefine vertical living with a grand, two-level design that blends luxury and practicality. With a majestic 6-meter high ceiling in the living area, these duplexes offer a dramatic, airy feel, with areas starting from 205 sqm. to 215 sqm.",
      "The ground floor includes a spacious living and dining area, open kitchen, maid's room, and guest bathroom. The upper level features three bedrooms — including a master suite with en-suite bathroom — and a shared bathroom.",
    ],
    highlights: [
      "Two-level duplex",
      "6-metre living-room ceiling",
      "205–215 sqm",
      "Three bedrooms",
      "Maid's room",
    ],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "Urban Villa",
  },
  {
    slug: "penthouse",
    label: "Penthouse",
    pluralLabel: "Penthouses",
    catalogValue: "penthouse",
    blocks: ["C"],
    summary: "Signature penthouses with private pools crowning Block C.",
    description: [
      "Block C culminates in signature penthouses with private pools, set above a limited collection of studios and one-bedroom apartments. Privacy, discretion and elevated urban living define this block.",
    ],
    // Highlights derived from the verified Block C description.
    highlights: ["Crowning Block C", "Private pool", "Privacy and discretion"],
    heroImage: null,
    images: [],
    floorPlans: [],
    inquireOption: "Penthouse",
  },
];

export const UNIT_TYPE_SLUGS = UNIT_TYPES.map((type) => type.slug);

const BY_SLUG = new Map(UNIT_TYPES.map((type) => [type.slug, type]));

/** Unit type by slug / catalog value (`unit.type`), or null. */
export function getUnitType(slug) {
  return BY_SLUG.get(String(slug ?? "").toLowerCase()) ?? null;
}

/** Display label for a unit's `type` value (falls back to the raw value). */
export function getUnitTypeLabel(slug) {
  return getUnitType(slug)?.label ?? (slug ? String(slug) : "");
}

/** Public page for a unit type: "/apartments/<slug>/". */
export function getUnitTypeHref(slug) {
  return `/apartments/${slug}/`;
}

/** "Block B" · "Blocks A, B and C" for a type's `blocks` list. */
export function formatTypeBlocks(blocks = []) {
  const list = (blocks || []).filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return `Block ${list[0]}`;
  return `Blocks ${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/**
 * Inquire form pre-filled with the type (and optionally one unit):
 * "/inquire/?type=urban-villa&unit=<unit _id>".
 */
export function getUnitTypeInquireHref(slug, unitId) {
  const params = new URLSearchParams();
  if (slug) params.set("type", slug);
  if (unitId) params.set("unit", String(unitId));
  const query = params.toString();
  return query ? `/inquire/?${query}` : "/inquire/";
}
