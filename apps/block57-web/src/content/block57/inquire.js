// Copy/images are provisional: finalise against the live block-57.com in Phase 0
// (exact fields, required rules, option list and success text of the WordPress form).

/** Path sent as `pagePath` with every inquiry (the server stores it). */
export const INQUIRE_PAGE_PATH = "/inquire/";

export const INQUIRE_PAGE = {
  eyebrow: "Block 57 · Cantonments, Accra",
  title: "Inquire",
  // Derived, neutral line (not verbatim from block-57.com) — confirm in Phase 0.
  intro:
    "Share a few details about the residence you are interested in and the Block 57 sales team will be in touch.",
  metaDescription:
    "Inquire about residences at Block 57, Cantonments, Accra — Executive Studios, 1 and 2 Bedroom apartments, Townhouses, Urban Villas and Penthouses.",
  // Verified success text from the WordPress form.
  successMessage:
    "Thank you — the sales team will be in touch with you shortly.",
  /** PROVISIONAL hero image: null renders the tonal placeholder (MediaFrame). */
  heroImage: null,
  heroImageAlt: "Block 57, Cantonments",
};

/** "Type of residence" options in the client's order; `value` is the unit-type slug.
 * The form submits the option `label` as `residenceType`. */
export const RESIDENCE_OPTIONS = [
  { label: "1 Bedroom", value: "one-bedroom" },
  { label: "2 Bedroom", value: "two-bedroom" },
  { label: "Urban Villa", value: "urban-villa" },
  { label: "Studio", value: "executive-studio" },
  { label: "Penthouse", value: "penthouse" },
  { label: "Townhouse", value: "townhouse" },
];

/** Extra `?type=` spellings accepted on /inquire/. */
const RESIDENCE_ALIASES = {
  studio: "executive-studio",
  "1-bedroom": "one-bedroom",
  "2-bedroom": "two-bedroom",
};

/** Mirrors server `contact.validation.js` (POST /api/v1/contact). */
export const INQUIRE_FIELD_LIMITS = {
  firstName: { min: 1, max: 80 },
  lastName: { min: 1, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
  phone: { max: 40 },
  residenceType: { max: 80 },
  unitLabel: { max: 80 },
  pagePath: { max: 300 },
};

/** Option for a unit-type slug (`one-bedroom`), alias (`studio`) or label (`1 Bedroom`). */
export function getResidenceOption(value) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  const slug = RESIDENCE_ALIASES[key] ?? key;
  return (
    RESIDENCE_OPTIONS.find(
      (option) => option.value === slug || option.label.toLowerCase() === key,
    ) ?? null
  );
}

/** Label submitted as `residenceType` for a slug / alias / label, or "". */
export function getResidenceLabel(value) {
  return getResidenceOption(value)?.label ?? "";
}

export const INQUIRE_FORM = {
  title: "Send an inquiry",
  requiredNote: "Fields marked * are required.",
  labels: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    phoneCountryCode: "Country calling code",
    residenceType: "Type of residence",
    message: "Message",
    website: "Leave this field empty",
  },
  residencePlaceholder: "Select a residence type",
  hints: {
    message: "Between 10 and 5,000 characters.",
  },
  submit: "Send inquiry",
  submitting: "Sending…",
  unit: {
    prefix: "Regarding residence",
    loading: "Finding the residence…",
    remove: (title) => `Remove residence ${title} from this inquiry`,
    removed: "The residence was removed from your inquiry.",
    missing:
      "The residence in your link is no longer listed. You can still send a general inquiry.",
    error:
      "We could not load the residence details. You can still send your inquiry.",
    /** Default message when the inquiry is about one residence. */
    message: (description) =>
      `Hello, I would like to know more about residence ${description}. Please contact me with further details.`,
  },
  success: {
    eyebrow: "Inquiry sent",
    home: "Back to home",
    again: "Send another inquiry",
  },
};

export const INQUIRE_ERRORS = {
  firstNameRequired: "Please enter your first name.",
  firstNameTooLong: "Your first name must be 80 characters or fewer.",
  lastNameRequired: "Please enter your last name.",
  lastNameTooLong: "Your last name must be 80 characters or fewer.",
  emailRequired: "Please enter your email address.",
  emailInvalid: "Please enter a valid email address, e.g. name@example.com.",
  emailTooLong: "Your email address must be 254 characters or fewer.",
  phoneInvalid: "Please enter a valid phone number.",
  phoneTooLong: "Your phone number must be 40 characters or fewer.",
  residenceTypeTooLong: "Please choose a residence type from the list.",
  messageRequired: "Please enter a message.",
  messageTooShort: "Your message must be at least 10 characters.",
  messageTooLong: "Your message must be 5,000 characters or fewer.",
  unitLabelTooLong:
    "The residence reference is too long. Remove it and try again.",
  checkFields: "Please check the highlighted fields.",
  network:
    "We could not send your inquiry. Please check your connection and try again, or call or email the sales team.",
  fallback: "Something went wrong. Please try again.",
};

export const INQUIRE_CONTACT = {
  title: "Speak with the sales team",
  // Derived, neutral line — confirm in Phase 0.
  lead: "Prefer a conversation? Reach the Block 57 sales team directly.",
  labels: {
    phone: "Call",
    email: "Email",
    whatsapp: "WhatsApp",
    visit: "Visit",
  },
  whatsappValue: "Chat with us",
  newTab: "(opens in a new tab)",
};
