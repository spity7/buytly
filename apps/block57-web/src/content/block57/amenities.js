// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
//
// /amenities/ content. Each amenity `copy` is the client's verified text.
// Group names, the page lead and the call to action are neutral UI copy
// ("derived"): confirm or replace in Phase 0.
// `slug` matches the catalog amenity value used on the project in the API and
// is also the anchor id on /amenities/ (e.g. /amenities/#padel-court).
// `image: null` renders the shared <MediaFrame> placeholder in `tone`; set it
// to `{ src: "/images/block57/…", alt: "…" }` once the real Block 57
// photography exists (the home amenities teaser reads the same shape).

import { LIFESTYLE_BALANCE } from "./lifestyle";

export const AMENITIES_PAGE = {
  eyebrow: "Amenities",
  title: "Amenities",
  // Verified "balance" line (shared with /life-style/ and the home teaser).
  intro: [LIFESTYLE_BALANCE],
  metaDescription:
    "Rooftop lounge, rooftop padel court, swimming pool, fitness centre, children's play area, business lounge and underground parking at Block 57, Cantonments.",
  /** Eyebrow above the page title (the home section uses the same label). */
  introEyebrow: "Life at Block 57", // derived
  indexLabel: "On this page", // derived
};

export const AMENITIES = [
  {
    slug: "rooftop-lounge",
    title: "Rooftop Lounge",
    copy: "The rooftop lounge is where Block 57 opens up. A place to unwind, host friends or simply enjoy the view. With BBQ stations and intimate seating pockets, it's perfect for slow evenings, casual gatherings and moments that deserve a little space above the city.",
    image: null,
    tone: "dark",
  },
  {
    slug: "padel-court",
    title: "Padel Court",
    copy: "Set on the rooftop, the padel court brings energy, movement and fresh air together in a way that feels different from the usual routine. Playing above the city adds an unexpected edge, turning fitness into something social, dynamic and genuinely fun.",
    image: null,
    tone: "sand",
  },
  {
    slug: "swimming-pool",
    title: "Swimming Pool",
    copy: "Surrounded by greenery, the swimming pool offers a calm escape from the pace of the city; a place to cool off, relax and enjoy unhurried moments.",
    image: null,
    tone: "stone",
  },
  {
    slug: "fitness-centre",
    title: "Fitness Centre",
    copy: "A state-of-the-art fitness centre fully equipped for every routine, turning daily workouts into a seamless, enjoyable part of your lifestyle.",
    image: null,
    tone: "dark",
  },
  {
    slug: "childrens-play-area",
    title: "Children's Play Area",
    copy: "The outdoor children's play area is where energy meets imagination, giving kids the freedom to play, explore and make friends in a safe, open setting.",
    image: null,
    tone: "sand",
  },
  {
    slug: "business-lounge",
    title: "Business Lounge",
    copy: "The business lounge offers a comfortable setting for work, meetings or focused time, allowing residents to stay productive while keeping home life separate.",
    image: null,
    tone: "stone",
  },
  {
    slug: "underground-parking",
    title: "Underground Parking",
    copy: "Secure underground parking keeps vehicles out of sight and pathways clear, freeing up the development for open, walkable spaces.",
    image: null,
    tone: "dark",
  },
];

/**
 * Visual grouping on /amenities/ (derived labels). `slug` is the group's
 * anchor id; `amenities` lists amenity slugs in display order.
 */
export const AMENITY_GROUPS = [
  {
    slug: "rooftop",
    title: "Rooftop",
    amenities: ["rooftop-lounge", "padel-court"],
  },
  {
    slug: "wellness",
    title: "Wellness",
    amenities: ["swimming-pool", "fitness-centre"],
  },
  {
    slug: "family-and-business",
    title: "Family & business",
    amenities: ["childrens-play-area", "business-lounge"],
  },
  {
    slug: "convenience",
    title: "Convenience",
    amenities: ["underground-parking"],
  },
];

/** Closing call to action (derived UI copy). */
export const AMENITIES_CTA = {
  eyebrow: "Inquire",
  title: "Find your residence at Block 57",
  text: "Tell us which residence interests you and the sales team will be in touch with you shortly.",
  primary: { href: "/inquire/", label: "Inquire" },
  secondary: { href: "/life-style/", label: "Discover the neighbourhood" },
};

export function getAmenity(slug) {
  return AMENITIES.find((amenity) => amenity.slug === slug) ?? null;
}

/** Groups with their amenity objects resolved (unknown slugs are skipped). */
export function getAmenityGroups() {
  return AMENITY_GROUPS.map((group) => ({
    ...group,
    items: group.amenities.map(getAmenity).filter(Boolean),
  })).filter((group) => group.items.length > 0);
}
