// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
//
// /life-style/ content. Paragraph copy and the "balance" line are the client's
// verified text. Lines marked "derived" are neutral UI copy (headings, labels,
// calls to action), not taken verbatim from block-57.com: confirm or replace in
// Phase 0. `media.src: null` renders the shared <MediaFrame> placeholder; set a
// local path ("/images/block57/…") and `alt` once the real photography exists.
import { ADDRESS, COORDINATES } from "./site";

export const LIFESTYLE_PAGE = {
  eyebrow: "Lifestyle",
  title: "Life in Cantonments", // derived (also used by the home teaser)
  metaDescription:
    "Block 57 is situated in Cantonments, an upscale suburb of Accra, Ghana, renowned for its tree-lined streets, diplomatic residences and serene atmosphere.",
};

export const LIFESTYLE_INTRO = [
  "Block 57 is situated in Cantonments, an upscale suburb of Accra, Ghana, renowned for its tree-lined streets, diplomatic residences, & serene atmosphere.",
  "This well-planned neighborhood blends modern convenience with a refined residential feel, making it one of the city's most sought-after addresses.",
];

export const LIFESTYLE_CONNECTIVITY = [
  "Residents enjoy proximity to top-tier restaurants, international schools, luxury hotels, and vibrant cultural spots. With easy access to Accra's commercial districts and entertainment hubs, Block 57 offers a seamless balance of exclusivity, comfort, and urban connectivity.",
];

export const LIFESTYLE_BALANCE =
  "A life defined by balance, where the energy of a padel match meets the calm of a family moment by the pool, all within a secure, serene compound.";

/** Dark full-bleed hero at the top of /life-style/. */
export const LIFESTYLE_HERO = {
  eyebrow: "Cantonments, Accra", // derived (location label)
  title: "Lifestyle",
  lead: LIFESTYLE_BALANCE,
  media: { src: null, alt: "Cantonments, Accra" },
  /** In-page navigation (anchors on /life-style/). */
  sectionNav: [
    { href: "#cantonments", label: "Cantonments" },
    { href: "#neighbourhood", label: "Neighbourhood" },
    { href: "#location", label: "Location" },
  ],
};

/** Editorial section with the three verified lifestyle paragraphs. */
export const LIFESTYLE_STORY = {
  id: "cantonments",
  eyebrow: "The neighbourhood", // derived
  title: LIFESTYLE_PAGE.title,
  statement: LIFESTYLE_INTRO[0],
  paragraphs: [LIFESTYLE_INTRO[1], LIFESTYLE_CONNECTIVITY[0]],
  media: [
    // Captions only name what the verified copy describes.
    { src: null, alt: "", caption: "Cantonments, Accra", tone: "stone" },
    { src: null, alt: "", caption: "Tree-lined streets", tone: "sand" },
  ],
};

/**
 * Qualitative points near Block 57, each taken from the verified lifestyle
 * paragraphs above: no venue names, distances or drive times, and nothing the
 * indexed block-57.com copy does not say (confirm the list in Phase 0).
 */
export const LIFESTYLE_NEARBY = [
  { slug: "streets", label: "Tree-lined streets" },
  { slug: "diplomatic", label: "Diplomatic residences" },
  { slug: "dining", label: "Top-tier restaurants & luxury hotels" },
  { slug: "schools", label: "International schools" },
  { slug: "culture", label: "Vibrant cultural spots" },
  { slug: "business", label: "Commercial districts & entertainment hubs" },
];

export const LIFESTYLE_NEIGHBOURHOOD = {
  id: "neighbourhood",
  eyebrow: "Neighbourhood",
  title: "Around Block 57", // derived
  items: LIFESTYLE_NEARBY,
};

/**
 * Keyless Google Maps embed. The loaded project's `location` wins; these
 * static coordinates (APPROXIMATE, see site.js) are the fallback.
 */
export const LIFESTYLE_MAP = {
  title: `Map of ${ADDRESS.full}`,
  address: ADDRESS.full,
  location: {
    coordinates: [COORDINATES.lng, COORDINATES.lat],
  },
};

export const LIFESTYLE_LOCATION = {
  id: "location",
  eyebrow: "Location",
  title: "In the heart of Cantonments", // derived from the verified intro
  addressLabel: "Address", // derived
  addressLines: [ADDRESS.street, ADDRESS.locality, ADDRESS.country],
  /** Search query for "Open in Google Maps" while the pin is approximate. */
  addressQuery: `${ADDRESS.street}, ${ADDRESS.neighbourhood}, ${ADDRESS.city}, ${ADDRESS.country}`,
  mapLinkLabel: "Open in Google Maps",
  mapLoadingLabel: "Loading map", // derived
};

/** Closing call to action (derived UI copy). */
export const LIFESTYLE_CTA = {
  eyebrow: "Inquire",
  title: "Make Cantonments home",
  text: "Tell us which residence interests you and the sales team will be in touch with you shortly.",
  primary: { href: "/inquire/", label: "Inquire" },
  secondary: { href: "/amenities/", label: "Explore the amenities" },
};
