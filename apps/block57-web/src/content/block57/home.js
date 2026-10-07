// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
//
// Home page ("/") content. Long-form copy is the client's verified text and is
// imported from the topic files (apartments.js, amenities.js, lifestyle.js) so
// each sentence lives in one place. Lines marked "derived" are neutral UI
// copy, not taken verbatim from block-57.com: confirm or replace in Phase 0.
// `media` entries are null until the real Block 57 photography/film exists;
// components then render the MediaFrame placeholder.

export const HOME_META = {
  // derived: replace with the Yoast title/description from WordPress (Phase 0).
  title: "Block 57 | Refined residences in Cantonments, Accra",
  description:
    "Block 57: intentional, refined and enduring homes in the heart of Cantonments, Accra. Executive Studios to Luxury Penthouses across Blocks A, B and C.",
};

export const HOME_HERO = {
  title: "Block 57",
  lead: "Refined residences in Cantonments, Accra",
  primaryCta: { href: "/apartments/", label: "Explore residences" },
  secondaryCta: { href: "/inquire/", label: "Inquire" },
  /**
   * Video-ready: set `video` to a local MP4 ("/videos/block57/hero.mp4") and
   * `poster` to its still ("/images/block57/hero.jpg"). With only `poster`
   * the hero shows the still; with neither, the tonal placeholder.
   */
  media: { poster: null, video: null, alt: "" },
  scrollCue: {
    href: "#home-intro",
    label: "Scroll",
    srLabel: "to the introduction",
  },
};

export const HOME_INTRO = {
  id: "home-intro",
  eyebrow: "The development",
  title: "Quality over excess. Design over trends.", // derived
  paragraphs: [
    "Block 57 was created to challenge conventional urban living by delivering homes that are intentional, refined and enduring. Set in the heart of Cantonments, the development brings together architecture, lifestyle and location in a way that prioritises quality over excess and design over trends.",
    "Every residence is carefully planned to support modern living; spaces that flow, details that matter, and environments that feel calm, private and considered.",
    "From Executive Studios to Luxury Penthouses, each home reflects a commitment to thoughtful living and long-term value.",
  ],
  cta: { href: "/apartments/", label: "View the residences" },
  // Counts are computed from the content files (blocks, unit types, amenities).
  factLabels: {
    blocks: "Residential blocks",
    unitTypes: "Residence types",
    amenities: "Amenities",
  },
};

export const HOME_MASTERPLAN = {
  // eyebrow / title / paragraphs come from MASTERPLAN (apartments.js).
  media: { src: null, alt: "", caption: "Masterplan" },
  /** Block cards show the opening sentence(s) of each verified block description. */
  blockCtaLabel: "Explore",
  blockHref: (slug) => `/apartments/#${slug}`,
};

export const HOME_RESIDENCES = {
  eyebrow: "Residences",
  title: "From Executive Studios to Luxury Penthouses",
  lead: "Six residence types across Blocks A, B and C.", // derived
  cta: { href: "/apartments/", label: "All residences" },
  // Live availability copy is shared: AVAILABILITY_COPY in apartments.js.
};

export const HOME_PRIVACY = {
  // heading + statement come from PRIVACY (apartments.js).
  headingLabel: "Privacy",
};

export const HOME_AMENITIES = {
  eyebrow: "Life at Block 57",
  title: "Amenities",
  // lead: the verified "balance" line (AMENITIES_PAGE.intro[0]).
  highlights: [
    "rooftop-lounge",
    "padel-court",
    "swimming-pool",
    "fitness-centre",
  ],
  cta: { href: "/amenities/", label: "All amenities" },
};

export const HOME_LIFESTYLE = {
  // eyebrow / title from LIFESTYLE_PAGE, paragraph from LIFESTYLE_INTRO[0].
  media: { src: null, alt: "", caption: "Cantonments, Accra" },
  cta: { href: "/life-style/", label: "Discover the neighbourhood" },
};

export const HOME_INQUIRE = {
  eyebrow: "Inquire",
  title: "Speak with the sales team", // derived
  lead: "Tell us which residence interests you and the sales team will be in touch with you shortly.", // derived
  cta: { href: "/inquire/", label: "Inquire" },
  labels: { phone: "Telephone", email: "Email", visit: "Visit" },
};

// Masterplan, privacy and block copy live in apartments.js; amenities in
// amenities.js; lifestyle in lifestyle.js (import them from there).
export { MASTERPLAN, PRIVACY, BLOCKS } from "./apartments";
