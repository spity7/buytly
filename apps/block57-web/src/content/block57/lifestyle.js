// /life-style/ content: verbatim live copy (phase0/spec/copy-deck.md →
// lifestyle.*). Paragraphs with a hard line break on live are arrays of lines
// (rendered with <br>). Images are asset ids from "@/lib/block57/assets".
// Corrected typo (client to confirm, OQ-13): Block C "…living experience his
// block features…" → "…living experience, this block features…".

export const LIFESTYLE_PAGE = {
  title: "Lifestyle",
  path: "/life-style/",
  // Opening sentences of the live intro paragraph.
  metaDescription:
    "At Block 57, living unfolds in rhythm. Mornings begin with sunlight filtering through private courtyards. Afternoons retreat into landscaped gardens or a swim under the open sky.",
};

/** lifestyle.intro: text column, three counters and the full-bleed render. */
export const LIFESTYLE_INTRO = {
  eyebrow: "an iconic landmark",
  title: "Lifestyle",
  lines: [
    "At Block 57, living unfolds in rhythm. Mornings begin with sunlight filtering through private courtyards. Afternoons retreat into landscaped gardens or a swim under the open sky.",
    "Evenings gather in rooftop lounges where the city glows beneath. It is a life defined by balance, where the energy of a padel match meets the calm of a family moment by the pool, all within a secure, serene compound. This is more than comfort. It is a daily experience, intentionally crafted for those who expect nothing less than exceptional.",
  ],
  link: { href: "/apartments/", label: "explore residences" },
  /** Static figures, as on live (OQ-33). */
  counters: [
    { value: 63, label: "Luxury Residential Units" },
    { value: 85, label: "Parking Spaces Available" },
    { value: 6, label: "Designed Types of residences" },
  ],
  image: "img-023",
};

/** lifestyle.location: static illustrated map + "Accra, Ghana". */
export const LIFESTYLE_LOCATION = {
  eyebrow: "Location",
  title: "Accra, Ghana",
  lines: [
    "Block 57 is situated in Cantonments, an upscale suburb of Accra, Ghana, renowned for its tree-lined streets, diplomatic residences, & serene atmosphere. This well-planned neighborhood blends modern convenience with a refined residential feel, making it one of the city’s most sought-after addresses.",
    "Surrounded by premium amenities, residents enjoy proximity to top-tier restaurants, international schools, luxury hotels, & vibrant cultural spots. With easy access to Accra’s commercial districts & entertainment hubs, Block 57 offers a seamless balance of exclusivity, comfort, and urban connectivity—making it the ideal place to call home.",
  ],
  image: "img-074",
  // The map's landmarks are baked into the bitmap: name them for screen readers.
  imageAlt:
    "Map of Cantonments locating Block 57 near Vodafone Cantonments, Elwak Sports Stadium, Midindi Hotel, Ghana International School and the American Embassy",
};

/** lifestyle.blocks: "Block Overview" with the aerial photo. */
export const LIFESTYLE_BLOCKS = {
  eyebrow: "ARCHITECTURE",
  title: "Block Overview",
  image: "img-075",
  blocks: [
    {
      name: "Block A",
      text: "Anchored by ground-floor townhouses with private gardens, this block offers a sense of space and privacy rarely found in apartment living. Rising above are well-planned executive studios and 1-bedroom apartments, creating a balanced environment that blends family-oriented living with refined urban convenience.",
    },
    {
      name: "Block B",
      text: "This block presents a carefully curated mix of Urban Villas and mid-level apartments, ranging from studios to two-bedroom residences. Designed to accommodate a variety of lifestyles, it offers flexibility, comfort and elevated living for professionals, couples and growing households.",
    },
    {
      name: "Block C",
      text: "Designed as a more intimate and exclusive living experience, this block features a limited collection of studios and one-bedroom apartments on the lower floors, culminating in signature penthouses with private pools above. Privacy, discretion and elevated urban living define this block.",
    },
  ],
};

/** lifestyle.privacy: "Privacy Through Design". */
export const LIFESTYLE_PRIVACY = {
  eyebrow: "design",
  title: "Privacy Through Design",
  lines: [
    "At Block 57, privacy is not just protected, it is architecturally embedded into the very fabric of the compound.",
    "The masterplan establishes a clear hierarchy of access, ensuring that every resident experiences discretion and autonomy, tailored to their lifestyle.",
  ],
  image: "img-034",
};
