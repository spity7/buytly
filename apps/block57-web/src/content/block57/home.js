// Home page ("/") content: the live block-57.com home, section by section
// (phase0/spec/copy-deck.md#home.*). Strings are stored in their source case;
// CSS uppercases eyebrows and buttons. Image fields are asset ids from
// "@/lib/block57/assets". Lines marked "derived" are not on the live site
// (accessible labels and the product's success state): client to approve.

import { CONTACT } from "./site";

/** Hero: YouTube background film (n1MM9xq9kSw), tagline and LEARN MORE. */
export const HOME_HERO = {
  /** Visually hidden page heading (live renders no visible H1). derived */
  title: "Block 57",
  tagline: "Crafted for the Few Who Expect More",
  cta: { href: "/life-style/", label: "learn more" },
  video: {
    youtubeId: "n1MM9xq9kSw",
    /** Still shown until the film plays, and instead of it under reduced motion. */
    poster: "img-023",
    pauseLabel: "Pause background video", // derived
    playLabel: "Play background video", // derived
  },
};

/** Green "A bold vision" band. */
export const HOME_INTRO = {
  eyebrow: "A bold vision",
  title:
    "Block 57 was created to challenge conventional urban living by delivering homes that are intentional, refined and enduring.",
  text: "Set in the heart of Cantonments, the development brings together architecture, lifestyle and location in a way that prioritises quality over excess and design over trends. Every residence is carefully planned to support modern living; spaces that flow, details that matter, and environments that feel calm, private and considered. From Executive Studios to Luxury Penthouses, each home reflects a commitment to thoughtful living and long-term value.",
};

/**
 * Continuous image ticker (13 slides, live order). Live alt text is the file
 * name (OQ-07), so each image has a written description (derived).
 */
export const HOME_MARQUEE = {
  label: "Block 57 renders", // derived: accessible name of the strip
  slides: [
    {
      id: "img-041",
      alt: "Street corner of Block 57 with cantilevered terraces, palms and the entrance",
    },
    {
      id: "img-039",
      alt: "Rooftop lounge and padel court on a Block 57 roof terrace, seen from above",
    },
    {
      id: "img-023",
      alt: "Block 57 seen from the street behind its slatted boundary wall",
    },
    {
      id: "img-038",
      alt: "Aerial view of Block 57 with its rooftop padel court and the courtyard pool",
    },
    {
      id: "img-007",
      alt: "Kitchen with timber cabinetry and a dining table with red chairs",
    },
    {
      id: "img-040",
      alt: "Aerial view of the Block 57 compound and its rooftop terraces from the street corner",
    },
    {
      id: "img-008",
      alt: "Living room with a timber TV wall, built-in shelving and curved sofas",
    },
    {
      id: "img-037",
      alt: "Aerial view of Block 57 with its glass-walled rooftop pool and planted terraces",
    },
    {
      id: "img-034",
      alt: "Block 57 seen from the street, with palms behind its boundary wall",
    },
    {
      id: "img-068",
      alt: "Double-height living room opening onto the dining area and kitchen",
    },
    {
      id: "img-059",
      alt: "Living room with curved armchairs, a TV wall between bookshelves and a timber coffee table",
    },
    {
      id: "img-033",
      alt: "Bedroom with an upholstered bed, a curved sofa and sheer curtains",
    },
    {
      id: "img-035",
      alt: "Landscaped walkway with palms and planters between the Block 57 buildings",
    },
  ],
};

/** "Find your fit": the six residence types (UNIT_TYPES, live home order). */
export const HOME_UNITS = {
  eyebrow: "units",
  title: "Find your fit",
};

/** "360 Virtual tour / Modern Living" (CloudPano). */
export const HOME_TOUR = {
  eyebrow: "360 Virtual tour",
  title: "Modern Living",
  tourId: "V1az0GjJk",
  frameTitle: "Block 57 360° virtual tour", // derived
};

/** "Modern conveniences": eight text cards (no images, no links). */
export const HOME_AMENITIES = {
  eyebrow: "amenities & services",
  title: "Modern conveniences",
  cards: [
    {
      title: "24 hour Concierge",
      text: "Round-the-clock assistance for all your needs, ensuring comfort every day.",
    },
    {
      title: "Swimming Pool",
      text: "A serene pool area for refreshing swims and relaxing moments.",
    },
    {
      title: "Rooftop",
      text: "Enjoy panoramic views and peaceful gatherings under the open sky.",
    },
    {
      title: "Underground Parking",
      text: "Secure, convenient, and easily accessible parking for residents.",
    },
    {
      title: "Gym & Fitness",
      text: "Stay active with modern equipment and a motivating fitness space.",
    },
    {
      title: "Kids Playground",
      text: "A fun and safe area where children can play and explore freely.",
    },
    {
      title: "Convenience Store",
      text: "In-house convenience store to provide all necessities at your door.",
    },
    {
      title: "Padel Court",
      text: "Modern court for exciting matches and an active lifestyle.",
    },
  ],
};

/**
 * Contact strip over the line drawings. Plain text on live; links here
 * (mailto: / tel:) with no visual change.
 */
export const HOME_CONTACT_STRIP = {
  title:
    "In person & virtual tours of our model residences available by appointment, please contact",
  background: "img-022",
  email: { label: CONTACT.email, href: CONTACT.emailHref },
  phone: { label: "0244 777 772", href: CONTACT.phoneHref },
};

/** "Home is waiting for you here" + the Schedule-a-tour popup. */
export const HOME_CTA = {
  titleLines: ["Home is waiting", "for you here"],
  background: "img-024",
  button: "schedule a tour",
};

/** "Schedule a tour" popup (live Contact Form 7 form 3240). */
export const SCHEDULE_TOUR = {
  title: "Schedule a tour",
  closeLabel: "Close", // derived (icon-only on live)
  fields: {
    fullName: { label: "Name", placeholder: "Name *" },
    email: { label: "Email", placeholder: "Email *" },
    phone: { label: "Phone", placeholder: "Phone *" },
    preferredDate: { label: "Preferred date" }, // derived label (native picker on live)
    preferredTime: { label: "Preferred time" }, // derived label
    message: { label: "Message", placeholder: "Message" },
  },
  /** Live time slots; the first one is selected by default, as on live. */
  timeSlots: [
    "7:00 AM",
    "9:00 AM",
    "11:00 AM",
    "1:00 PM",
    "3:00 PM",
    "5:00 PM",
  ],
  /** Live textarea maxlength. */
  messageMaxLength: 2000,
  submit: "submit",
  successAction: "schedule another tour", // derived
};
