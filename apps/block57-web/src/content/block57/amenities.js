// /amenities/ content: verbatim live copy (phase0/spec/copy-deck.md →
// amenities.*), kept as on live: "Fitness Center" heading vs "fitness centre"
// in the copy, and "Daily life unfold" (OQ-13, client to confirm).
// Typographic fix: the straight apostrophe in "shouldn't" is curly, like the
// rest of the copy.
// `slug` matches the catalog amenity value in the API and is the section
// anchor (/amenities/#padel-court). `image` is an asset id from
// "@/lib/block57/assets". The live mobile-only photos of the pool (img-029)
// and the play area (img-027) are the same pictures as the desktop ones: the
// asset import aliases them, so each row has a single image.

export const AMENITIES_PAGE = {
  title: "Amenities",
  path: "/amenities/",
  metaDescription:
    "Rooftop lounge, fitness center, rooftop padel court, swimming pool, children’s play area, convenience store, underground parking and business lounge at Block 57, Cantonments.",
  ogImage: "img-011",
};

/**
 * amenities.row-1 … row-5: full-bleed 50/50 rows, in live order. The photo is
 * on the left on rows 1, 3 and 5, on the right on rows 2 and 4.
 */
export const AMENITY_ROWS = [
  {
    slug: "rooftop-lounge",
    title: "Rooftop Lounge",
    copy: "Step upstairs, breathe, and take in the city. The rooftop lounge is where Block 57 opens up. A place to unwind, host friends or simply enjoy the view. With BBQ stations and intimate seating pockets, it’s perfect for slow evenings, casual gatherings and moments that deserve a little space above the city.",
    image: "img-011",
  },
  {
    slug: "fitness-centre",
    title: "Fitness Center",
    copy: "Elevate your wellness effortlessly at our state-of-the-art fitness centre. Fully equipped for every routine, it turns daily workouts into a seamless, enjoyable part of your lifestyle: because staying fit should never be an excuse.",
    image: "img-021",
  },
  {
    slug: "padel-court",
    title: "Padel Court",
    copy: "Not every workout needs walls. Set on the rooftop, the padel court brings energy, movement and fresh air together in a way that feels different from the usual routine. Playing above the city adds an unexpected edge, turning fitness into something social, dynamic and genuinely fun.",
    image: "img-026",
  },
  {
    slug: "swimming-pool",
    title: "Swimming Pool",
    copy: "Some days call for laps. Others call for floating. Early mornings, quiet afternoons or slow weekends all find their rhythm here. Surrounded by greenery, the swimming pool offers a calm escape from the pace of the city; a place to cool off, relax and enjoy unhurried moments.",
    image: "img-029",
  },
  {
    slug: "childrens-play-area",
    title: "Children’s Play Area",
    copy: "Because childhood is best enjoyed outdoors. Our outdoor children’s play area is where energy meets imagination, giving kids the freedom to play, explore and make friends in a safe, open setting. Thoughtfully created for both fun and learning, it’s a place where families connect, routines feel easier, and kids simply get to be kids.",
    image: "img-028",
  },
];

/** amenities.highlights-heading + amenities.highlights-cards. */
export const AMENITY_HIGHLIGHTS = {
  eyebrow: "highlights",
  title: "Daily life unfold in unforgettable spaces",
  cards: [
    {
      slug: "convenience-store",
      title: "Convenience Store",
      copy: "Some conveniences are small, but they change everything. Running out of essentials shouldn’t require a trip across town. The on-site convenience store makes everyday living simpler, giving residents quick access to necessities without leaving the comfort of the development.",
      image: "img-020",
    },
    {
      slug: "underground-parking",
      title: "Underground Parking",
      copy: "When everything has its place, movement feels effortless and coming home feels calm. Secure underground parking keeps vehicles out of sight and pathways clear, freeing up the development for open, walkable spaces.",
      image: "img-019",
    },
    {
      slug: "business-lounge",
      title: "Business Lounge",
      copy: "Work doesn’t always belong at the dining table. The business lounge offers a comfortable setting for work, meetings or focused time, allowing residents to stay productive while keeping home life separate. It’s there when you need focus, and out of the way when you don’t.",
      image: "img-018",
    },
  ],
};
