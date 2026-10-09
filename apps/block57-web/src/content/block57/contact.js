// /contact/ copy, verbatim from the live block-57.com
// (phase0/spec/copy-deck.md#contact.*). Strings marked "derived" have no live
// equivalent and are listed for client approval. Form messages (CF7 wording)
// live in components/block57/forms/messages.js; phone/email values and links
// in site.js (CONTACT).

/** Path sent as `pagePath` with every message (the server stores it). */
export const CONTACT_PAGE_PATH = "/contact/";

export const CONTACT_PAGE = {
  title: "Contact",
  path: CONTACT_PAGE_PATH,
  // Derived (no meta description on live, OQ-29).
  metaDescription:
    "Contact Block 57, First Circular Crescent, Cantonments, Accra: call 0244 777 772, email info@block-57.com or send the sales team a message.",
};

export const CONTACT_FORM = {
  title: "Drop us a line",
  // WordPress comment-form boilerplate shown on live (kept verbatim, OQ-14).
  note: "Your email address will not be published. Required fields are marked *",
  /** Visible placeholders (the live form has no visible labels). */
  placeholders: {
    phone: "Phone*",
    email: "Email*",
    message: "Message",
  },
  /** Visually hidden <label>s (derived, accessibility). */
  labels: {
    phone: "Phone",
    email: "Email",
    message: "Message",
  },
  submit: "submit",
  // Derived: link back to the form after the CF7 thank-you message.
  again: "send another message",
};

export const CONTACT_DETAILS = {
  addressLabel: "Building address",
  address: "First Circular Crescent, Cantonments - Accra.",
  inquiriesLabel: "General inquiries",
  /** Live format on this page (the footer shows +233 244 777 772). */
  phoneDisplay: "0244 777 772",
};

export const CONTACT_MAP = {
  // Derived: iframe title and the link shown while the map loads (or if
  // Google Maps is blocked).
  title: "Map of Block 57, First Circular Crescent, Cantonments, Accra",
  openLabel: "Open in Google Maps",
  /** ≈ the live view distance (992 m). */
  zoom: 17,
};
