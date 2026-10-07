// Copy/images are provisional: finalise against the live block-57.com in Phase 0.
import {
  getPlatformSupportEmail,
  getPlatformSupportPhone,
  getPlatformSupportPhoneDisplay,
} from "@/data/platformContact";

export const SITE_NAME = "Block 57";

/** Slug of the single Block 57 project in the API (`/projects/slug/:slug`). */
export const BLOCK57_PROJECT_SLUG =
  process.env.NEXT_PUBLIC_BLOCK57_PROJECT_SLUG?.trim() || "block-57";

/** Primary navigation (WordPress order). Internal hrefs end with "/". */
export const SITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/life-style/", label: "Lifestyle" },
  { href: "/apartments/", label: "Apartments" },
  { href: "/amenities/", label: "Amenities" },
];

/** Call-to-action shown as a button in the header. */
export const INQUIRE_LINK = { href: "/inquire/", label: "Inquire" };

/** Account routes live in the `(app)` route group (full page reload). */
export const ACCOUNT_LINKS = {
  signIn: { href: "/login/", label: "Sign in" },
  account: { href: "/dashboard-home/", label: "My account" },
  favourites: { href: "/dashboard-my-favourites/", label: "Favourites" },
};

const phone = getPlatformSupportPhone();

export const CONTACT = {
  phone,
  phoneDisplay: getPlatformSupportPhoneDisplay(),
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

/** APPROXIMATE map position (Cantonments); confirm the exact site pin in Phase 0. */
export const COORDINATES = {
  lat: 5.5786,
  lng: -0.1745,
  approximate: true,
};

/** Short brand line (derived from the verified intro copy). */
export const SITE_TAGLINE =
  "Intentional, refined and enduring homes in the heart of Cantonments.";

/** Default meta description (verified intro copy, first sentence). */
export const SITE_DESCRIPTION =
  "Block 57 was created to challenge conventional urban living by delivering homes that are intentional, refined and enduring, set in the heart of Cantonments, Accra.";

export const WHATSAPP_MESSAGE =
  "Hello Block 57, I would like to know more about the residences.";
