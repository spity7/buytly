// Global site content: navigation, contact details and external links, as on
// the live block-57.com (phase0/spec/copy-deck.md#global.*). Labels are stored
// in their source case; CSS uppercases nav, buttons and eyebrows.
import {
  getPlatformSupportEmail,
  getPlatformSupportPhone,
  getPlatformSupportPhoneDisplay,
} from "@/data/platformContact";

export const SITE_NAME = "Block 57";

/** Live home document title (inner pages use "<Page> – Block 57"). */
export const HOME_TITLE = "Block 57 – Real estate Project";

/** 404 page title (derived copy: no live equivalent, to approve). */
export const NOT_FOUND_TITLE = "Page not found";

/** Slug of the single Block 57 project in the API (`/projects/slug/:slug`). */
export const BLOCK57_PROJECT_SLUG =
  process.env.NEXT_PUBLIC_BLOCK57_PROJECT_SLUG?.trim() || "block-57";

/**
 * Google Tag Manager container (e.g. "GTM-XXXXXXX"). Unset by default, so no
 * tracking code loads; the live site uses GTM-MBQHCVSP (OQ-30: consent first).
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";

/** Primary navigation (header + mobile drawer). Internal hrefs end with "/". */
export const SITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/life-style/", label: "Lifestyle" },
  { href: "/apartments/", label: "Apartments" },
  { href: "/amenities/", label: "Amenities" },
  { href: "/gallery/", label: "Gallery" },
];

/** Header solid white pill (hidden ≤767px), footer link, floating button. */
export const INQUIRE_LINK = { href: "/inquire/", label: "Inquire" };

/**
 * The brochure is a Google Drive file (OQ-03: switch to a self-hosted PDF when
 * supplied). Opens in a new tab; `/brochure/` redirects here.
 */
export const BROCHURE_URL =
  "https://drive.google.com/file/d/11R7LkmgJ7GNH0fyAm3Fb5UPl4mU_Jtw0/view";
export const BROCHURE_LINK = { href: BROCHURE_URL, label: "Brochure" };

export const INSTAGRAM_URL = "https://www.instagram.com/block57gh/";

/** Footer "Explore" band: two link lists (Inquire fixed to /inquire/). */
export const FOOTER_EXPLORE = {
  title: "Explore",
  lists: [
    [
      { href: "/gallery/", label: "Gallery" },
      { href: "/apartments/", label: "Apartments" },
      { href: "/life-style/", label: "Life-style" },
    ],
    [BROCHURE_LINK, INQUIRE_LINK],
  ],
};

export const FOOTER_COPYRIGHT = "Block57. All rights reserved";

/** Account routes live in the `(app)` route group (full page reload). */
export const ACCOUNT_LINKS = {
  signIn: { href: "/login/", label: "Sign in" },
  account: { href: "/dashboard-home/", label: "My account" },
  favourites: { href: "/dashboard-my-favourites/", label: "Favourites" },
};

const phone = getPlatformSupportPhone();

export const CONTACT = {
  phone, // +233244777772
  phoneDisplay: getPlatformSupportPhoneDisplay(), // +233 244 777 772
  phoneHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
  email: getPlatformSupportEmail(),
  emailHref: `mailto:${getPlatformSupportEmail()}`,
};

export const ADDRESS = {
  street: "First Circular Crescent",
  locality: "Cantonments - Accra",
  city: "Accra",
  neighbourhood: "Cantonments",
  country: "Ghana",
  countryCode: "GH",
  full: "First Circular Crescent, Cantonments - Accra",
};

/** Centre of the live contact-page map (OQ-06: exact site pin to confirm). */
export const COORDINATES = {
  lat: 5.583338,
  lng: -0.1744589,
  approximate: true,
};

/** Default meta description (derived from the live intro copy; OQ-29). */
export const SITE_DESCRIPTION =
  "Block 57 was created to challenge conventional urban living by delivering homes that are intentional, refined and enduring, set in the heart of Cantonments, Accra.";

/** Prefilled WhatsApp text (live has none; kept per OQ-32). */
export const WHATSAPP_MESSAGE =
  "Hello Block 57, I would like to know more about the residences.";
