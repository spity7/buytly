// /inquire/ copy, verbatim from the live block-57.com
// (phase0/spec/copy-deck.md#inquire.*). Strings marked "derived" have no live
// equivalent (meta description, accessible labels, product features such as
// the unit chip) and are listed for client approval. Form messages (CF7
// wording) live in components/block57/forms/messages.js.
import { resolveUnitType } from "@/content/block57/unitTypes";

/** Path sent as `pagePath` with every inquiry (the server stores it). */
export const INQUIRE_PAGE_PATH = "/inquire/";

export const INQUIRE_PAGE = {
  title: "Inquire",
  path: INQUIRE_PAGE_PATH,
  // Derived (no meta description on live, OQ-29).
  metaDescription:
    "Inquire about residences at Block 57, Cantonments, Accra: Executive Studios, 1 and 2 Bedroom apartments, Urban Villas, Townhouses and Penthouses.",
  /** Portrait beside the form (VV_10, asset id). */
  image: "img-073",
};

/** H5 above the form (inquire.form). */
export const INQUIRE_INTRO =
  "Please submit your contact information. The sales team will be in touch with you shortly.";

/**
 * "Type of residence" radios in the live order. The label is submitted as
 * `residenceType`; `slug` is the residence page slug (/apartments/<slug>/),
 * used to pre-select an option from `?type=`.
 */
export const RESIDENCE_OPTIONS = [
  { label: "1 Bedroom", slug: "1-bedroom" },
  { label: "2 Bedroom", slug: "2-bedroom" },
  { label: "Urban Villa", slug: "urban-villa" },
  { label: "Studio", slug: "executive-studio" },
  { label: "Penthouse", slug: "penthouse" },
  { label: "Townhouse", slug: "townhouse" },
];

/** Checked by default, as on live (OQ-45); `?type=` overrides it. */
export const DEFAULT_RESIDENCE = "1 Bedroom";

/** WordPress category spelling of the studio (`?type=studio`). */
const RESIDENCE_ALIASES = { studio: "executive-studio" };

/**
 * Radio label for a `?type=` value or a unit's `type`: the page slug
 * ("1-bedroom"), the API catalog value ("one-bedroom", see unitTypes.js), the
 * alias "studio" or the label itself ("1 Bedroom"). "" when unknown.
 */
export function getResidenceLabel(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!key) return "";
  const byLabel = RESIDENCE_OPTIONS.find(
    (option) => option.label.toLowerCase() === key,
  );
  if (byLabel) return byLabel.label;
  const slug = RESIDENCE_ALIASES[key] ?? resolveUnitType(key)?.slug;
  return RESIDENCE_OPTIONS.find((option) => option.slug === slug)?.label ?? "";
}

export const INQUIRE_FORM = {
  /** Visible placeholders (the live form has no visible labels). */
  placeholders: {
    firstName: "First Name *",
    lastName: "Last Name *",
    phone: "Phone *",
    email: "Email *",
    message: "Message",
  },
  /** Visually hidden <label>s (derived, accessibility). */
  labels: {
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    email: "Email",
    message: "Message",
  },
  residenceLegend: "Type of residence you are interested in",
  /** "Field with * required" (the second part in green). */
  requiredNote: ["Field with ", "* required"],
  submit: "submit",
  // Derived: link back to the form after the CF7 thank-you message.
  again: "send another inquiry",
  /** `/inquire/?unit=<id>` chip (derived copy). */
  unit: {
    prefix: "Regarding",
    loading: "Finding the residence…",
    remove: (title) => `Remove residence ${title} from this inquiry`,
    removed: "The residence was removed from your inquiry.",
    missing:
      "The residence in your link is no longer listed. You can still send a general inquiry.",
    error:
      "We could not load the residence details. You can still send your inquiry.",
    /** Message pre-filled when the inquiry is about one residence. */
    message: (description) =>
      `Hello, I would like to know more about residence ${description}. Please contact me with further details.`,
  },
};
