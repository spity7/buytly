// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
// Verbatim client copy: masterplan, privacy and the three block descriptions.
// UI labels (headings, notices, empty/error states) are neutral and derived.
// Images: `null` renders the shared <MediaFrame> placeholder; set a local path
// ("/images/block57/…") once the real Block 57 renders exist.

export const APARTMENTS_PAGE = {
  eyebrow: "Apartments",
  title: "Residences at Block 57",
  intro: [
    "From Executive Studios to Luxury Penthouses, each home reflects a commitment to thoughtful living and long-term value.",
  ],
  metaDescription:
    "Executive Studios, 1 and 2 Bedroom apartments, Townhouses, Urban Villas and Penthouses across Blocks A, B and C at Block 57, Cantonments.",
  heroImage: null,
  heroImageAlt: "Block 57, Cantonments",
  /** In-page navigation shown in the hero (anchors on /apartments/). */
  sectionNav: [
    { href: "#masterplan", label: "Masterplan" },
    { href: "#block-a", label: "Block A" },
    { href: "#block-b", label: "Block B" },
    { href: "#block-c", label: "Block C" },
    { href: "#residences", label: "Residences" },
  ],
};

export const MASTERPLAN = {
  eyebrow: "Masterplan",
  title: "Three distinct residential blocks",
  paragraphs: [
    "Block 57 is thoughtfully composed of three distinct residential blocks — Block A, Block B, and Block C — each designed to balance privacy, light, and community within the serene setting of Cantonments.",
    "The masterplan is a deliberate orchestration of space, lifestyle, and connection.",
  ],
  image: null,
  imageAlt: "Block 57 masterplan with Blocks A, B and C",
  imageCaption: "Masterplan · Blocks A, B and C",
};

export const PRIVACY = {
  eyebrow: "Privacy",
  title: "Discretion by design",
  paragraphs: [
    "At Block 57, privacy is not just protected, it is architecturally embedded into the very fabric of the compound. The masterplan establishes a clear hierarchy of access, ensuring that every resident experiences discretion and autonomy, tailored to their lifestyle.",
  ],
};

/** Blocks A/B/C. `unitTypes` are slugs from unitTypes.js, in display order. */
export const BLOCKS = [
  {
    id: "A",
    slug: "block-a",
    label: "Block A",
    description:
      "Block A is anchored by ground-floor townhouses with private gardens, offering a sense of space and privacy rarely found in apartment living. Above the townhouses are well-planned executive studios and 1-bedroom apartments, creating a balanced environment that blends family-oriented living with refined urban convenience.",
    unitTypes: ["townhouse", "executive-studio", "one-bedroom"],
    image: null,
    imageAlt: "Block A at Block 57",
  },
  {
    id: "B",
    slug: "block-b",
    label: "Block B",
    description:
      "Block B presents a carefully curated mix of Urban Villas and mid-level apartments, ranging from studios to two-bedroom residences. It's designed to accommodate a variety of lifestyles, offering flexibility, comfort and elevated living for professionals, couples and growing households.",
    unitTypes: [
      "urban-villa",
      "executive-studio",
      "one-bedroom",
      "two-bedroom",
    ],
    image: null,
    imageAlt: "Block B at Block 57",
  },
  {
    id: "C",
    slug: "block-c",
    label: "Block C",
    description:
      "Block C is designed as a more intimate and exclusive living experience. A limited collection of studios and one-bedroom apartments on the lower floors, culminating in signature penthouses with private pools above. Privacy, discretion and elevated urban living define this block.",
    unitTypes: ["executive-studio", "one-bedroom", "penthouse"],
    image: null,
    imageAlt: "Block C at Block 57",
  },
];

export function getBlock(id) {
  return (
    BLOCKS.find((block) => block.id === String(id ?? "").toUpperCase()) ?? null
  );
}

/** Residence-type grid on /apartments/ (live "N of M available" per type). */
export const RESIDENCES_SECTION = {
  eyebrow: "Residences",
  title: "Residence types",
  lead: "Every residence is carefully planned to support modern living; spaces that flow, details that matter, and environments that feel calm, private and considered.",
};

/** Closing call to action (index and type pages). */
export const APARTMENTS_CTA = {
  eyebrow: "Inquire",
  title: "Find the residence that suits you",
  text: "Share a few details about the residence you are interested in and the Block 57 sales team will be in touch.",
  // Type pages pre-fill the residence type: /inquire/?type=<slug>.
  primary: { href: "/inquire/", label: "Inquire" },
};

/** Section labels on /apartments/<type>/. */
export const TYPE_PAGE_SECTIONS = {
  overview: { eyebrow: "Overview" },
  gallery: { eyebrow: "Gallery", title: "A closer look" },
  floorPlans: {
    eyebrow: "Plans",
    title: "Floor plans",
    empty: "Floor plans are available on request.",
    open: "Open full plan",
  },
  availability: {
    eyebrow: "Availability",
    title: "Current availability",
  },
  others: { eyebrow: "Explore", title: "Other residences" },
};

/** Live-data states (availability table, counts, unit deep links). */
export const AVAILABILITY_COPY = {
  error: "Live availability is temporarily unavailable.",
  empty:
    "No residences of this type are currently listed — inquire for availability.",
  unitNotListed: "That residence is no longer listed.",
  resolving: "Finding that residence…",
  countOnRequest: "Availability on request",
  soldOut: "Sold out",
  loading: "Loading availability",
  retry: "Try again",
};
